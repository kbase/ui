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
import { toast } from 'react-hot-toast';

/**
 * Content for the Account tab in the Account page
 */
export const AccountInfo: FC = () => {
  const token = useAppSelector(({ auth }) => auth.token ?? '');
  const username = useAppSelector(({ auth }) => auth.username ?? '');

  // Profile
  const { data: profiles, refetch: refetchProfiles } = getUserProfile.useQuery({
    usernames: [username],
  });
  const profile = profiles?.[0]?.[0];
  const [triggerSetProfile, setProfileResult] = setUserProfile.useMutation();

  // Account
  const { data: accountData, refetch: refetchAccount } = getMe.useQuery({
    token,
  });
  const [triggerSetMe, setMeResult] = setMe.useMutation();

  // Form

  const form = useForm<{ name: string; email: string }>({
    values: {
      name: accountData?.display ?? '',
      email: accountData?.email ?? '',
    },
    mode: 'onChange',
  });

  // Save the form info to Account/Profile
  const onSubmit = form.handleSubmit(
    async (formData) => {
      if (!profile) throw new Error('Error, undefined profile cannot be set');
      await triggerSetProfile([
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
      await triggerSetMe({
        token,
        meUpdate: {
          display: formData.name,
          email: formData.email,
        },
      });
    },
    (e) => {
      const firstErr = [e.name, e.email].filter(Boolean)?.[0];
      toast(firstErr?.message ?? 'Something went wrong');
    }
  );

  const onReset = () => {
    setMeResult.reset();
    setProfileResult.reset();
    form.reset();
    refetchProfiles();
    refetchAccount();
  };

  // Request States
  const save = {
    loading: setProfileResult.isLoading || setMeResult.isLoading,
    complete:
      setProfileResult.isSuccess &&
      setMeResult.isSuccess &&
      !setProfileResult.isUninitialized &&
      !setMeResult.isUninitialized,
    error: setProfileResult.isError || setMeResult.isError,
  };

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
                save.loading ? (
                  <Loader data-testid="loader" loading={true} type="spinner" />
                ) : save.complete ? (
                  <FontAwesomeIcon icon={faCheck} />
                ) : save.error ? (
                  <FontAwesomeIcon icon={faX} />
                ) : undefined
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
          <Typography>{accountData?.user}</Typography>
        </Stack>
        <Stack>
          <Typography fontWeight="bold">Account Created</Typography>
          <Typography>
            {new Date(accountData?.created ?? 0).toLocaleString()}
          </Typography>
        </Stack>
        <Stack>
          <Typography fontWeight="bold">Last Sign In</Typography>
          <Typography>
            {new Date(accountData?.lastlogin ?? 0).toLocaleString()}
          </Typography>
        </Stack>
      </Stack>
    </Stack>
  );
};
