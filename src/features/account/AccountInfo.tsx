import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faInfoCircle, faX } from '@fortawesome/free-solid-svg-icons';
import {
  Button,
  FormControl,
  FormLabel,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { FC } from 'react';
import { useForm } from 'react-hook-form';
import { Loader } from '../../common/components';
import { emailRegex } from '../../common';
import { getMe, setMe } from '../../common/api/authService';
import { useAppSelector } from '../../common/hooks';
import {
  getUserProfile,
  setUserProfile,
} from '../../common/api/userProfileApi';

/**
 * Content for the Account tab in the Account page
 */
export const AccountInfo: FC = () => {
  const token = useAppSelector((s) => s.auth.token) ?? '';
  const username = useAppSelector((s) => s.auth.username) ?? '';

  // Profile
  const profiles = getUserProfile.useQuery({ usernames: [username] });
  const profile = profiles.data?.[0]?.[0];
  const [triggerSetProfile, setProfileResult] = setUserProfile.useMutation();
  // Account
  const account = getMe.useQuery({ token });
  const [triggerSetMe, setMeResult] = setMe.useMutation();

  const form = useForm<{ name: string; email: string }>({
    values: {
      name: account.data?.display ?? '',
      email: account.data?.email ?? '',
    },
    mode: 'onChange',
  });

  const onSubmit = form.handleSubmit((formData) => {
    if (!profile) throw new Error('Error, undefined profile cannot be set');
    triggerSetProfile([
      {
        profile: {
          user: {
            username: profile.user.username,
            realname: formData.name,
          },
          profile: profile.profile,
        },
      },
      token,
    ]);
    triggerSetMe({
      token,
      meUpdate: {
        display: formData.name,
        email: formData.email,
      },
    });
  });

  const onReset = () => {
    setMeResult.reset();
    setProfileResult.reset();
    form.reset();
    profiles.refetch();
    account.refetch();
  };

  const loading = setProfileResult.isLoading || setMeResult.isLoading;
  const complete =
    !setProfileResult.isUninitialized &&
    !setMeResult.isUninitialized &&
    setProfileResult.isSuccess &&
    setMeResult.isSuccess;
  const error = setProfileResult.isError || setMeResult.isError;

  return (
    <Stack
      spacing={4}
      role="tabpanel"
      id="account-tabpanel"
      aria-labelledby="account-tab"
    >
      <Stack direction="row" justifyContent="space-between">
        <Typography variant="h2">Edit Account</Typography>
        <Tooltip
          title={
            <Typography variant="body2">
              You may view and edit edit your basic account information here.
              Changes saved will be immediately available.
            </Typography>
          }
        >
          <Button startIcon={<FontAwesomeIcon icon={faInfoCircle} />}>
            About this tab
          </Button>
        </Tooltip>
      </Stack>
      <form onSubmit={onSubmit}>
        <Stack spacing={2}>
          <FormControl>
            <FormLabel htmlFor="username-input">Name</FormLabel>
            <TextField
              id="username-input"
              {...form.register('name', {
                required: true,
                minLength: 1,
              })}
              helperText="Your real name, displayed to other KBase users"
            />
          </FormControl>
          <FormControl>
            <FormLabel htmlFor="email-input">Email</FormLabel>
            <TextField
              id="email-input"
              color={form.formState.errors.email ? 'error' : undefined}
              {...form.register('email', {
                required: true,
                pattern: {
                  value: emailRegex,
                  message: 'Invalid email address',
                },
              })}
              helperText="KBase may use this email address to communicate important information about KBase or your account. KBase will not share your email address with anyone, and other KBase users will not be able to see it."
            />
          </FormControl>
          <Stack spacing={1} direction="row">
            <Button
              variant="outlined"
              color="base"
              size="large"
              onClick={onReset}
            >
              Reset
            </Button>
            <Button
              type="submit"
              variant={!form.formState.isValid ? 'outlined' : 'contained'}
              endIcon={
                <Loader loading={loading} type="spinner">
                  {complete ? (
                    <FontAwesomeIcon icon={faCheck} />
                  ) : error ? (
                    <FontAwesomeIcon icon={faX} />
                  ) : undefined}
                </Loader>
              }
              size="large"
            >
              {'Save'}
            </Button>
          </Stack>
        </Stack>
      </form>
      <Typography variant="h2">Account Info</Typography>
      <Stack spacing={2}>
        <Stack>
          <Typography fontWeight="bold">Username</Typography>
          <Typography>{account.data?.user}</Typography>
        </Stack>
        <Stack>
          <Typography fontWeight="bold">Account Created</Typography>
          <Typography>
            {new Date(account.data?.created ?? 0).toLocaleString()}
          </Typography>
        </Stack>
        <Stack>
          <Typography fontWeight="bold">Last Sign In</Typography>
          <Typography>
            {new Date(account.data?.lastlogin ?? 0).toLocaleString()}
          </Typography>
        </Stack>
      </Stack>
    </Stack>
  );
};
