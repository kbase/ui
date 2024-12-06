import { faAngleRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { FC, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../common/hooks';
import classes from './SignUp.module.scss';
import ReferalSources from './ReferralSources.json';
import { loginUsernameSuggest } from '../../common/api/authService';
import { useForm } from 'react-hook-form';
import { setAccount, setProfile } from './SignupSlice';

export const useCheckLoginDataOk = () => {
  const navigate = useNavigate();
  const loginData = useAppSelector((state) => state.signup.loginData);
  useEffect(() => {
    if (!loginData) {
      toast('You must login using a provider first to sign up!');
      navigate('/signup/1');
    }
  }, [loginData, navigate]);
};

/**
 * Account information form for sign up flow
 */
export const AccountInformation: FC<{}> = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  useCheckLoginDataOk();

  // Login Data
  const loginData = useAppSelector((state) => state.signup.loginData);

  // Account data
  const account = useAppSelector((state) => state.signup.account);

  //username availibility
  const [username, setUsername] = useState(account.username ?? '');
  const userAvail = loginUsernameSuggest.useQuery(username);
  const nameShort = username.length < 3;
  const nameAvail =
    userAvail.currentData?.availablename === username.toLowerCase();

  const surveyQuestion = 'How did you hear about us? (select all that apply)';
  const [optionalText, setOptionalText] = useState<Record<string, string>>({});

  // Form state
  const { register, handleSubmit } = useForm({
    defaultValues: {
      account: account,
      profile: {
        userdata: {
          organization: '',
          department: '',
        },
        surveydata: {
          referralSources: {
            question: surveyQuestion,
            response: {} as Record<string, string | boolean>,
          },
        },
      },
    },
  });

  // Form submission
  const onSubmit = handleSubmit(async (fieldValues, event) => {
    event?.preventDefault();
    // Add in survey text content from form
    ReferalSources.forEach((src) => {
      if (
        src.customText &&
        fieldValues.profile.surveydata.referralSources.response[src.value] ===
          true
      )
        fieldValues.profile.surveydata.referralSources.response[src.value] =
          optionalText[src.value];
    });
    // dispatch form data to signup state
    dispatch(setAccount(fieldValues.account));
    dispatch(
      setProfile({
        userdata: {
          ...fieldValues.profile.userdata,
          avatarOption: 'gravatar',
          gravatarDefault: 'identicon',
        },
        surveydata: fieldValues.profile.surveydata,
      })
    );
    // next step!
    navigate('/signup/3');
  });

  return (
    <Stack spacing={2}>
      <Alert>
        <Stack spacing={1}>
          <span>
            You have signed in with your <strong>{loginData?.provider}</strong>{' '}
            account <strong>{loginData?.create[0].provemail}</strong>. This will
            be the account linked to your KBase account.
          </span>
          <Accordion className={classes['collapsible-message']} disableGutters>
            <AccordionSummary
              expandIcon={<FontAwesomeIcon icon={faAngleRight} />}
              aria-controls="panel1-content"
              id="panel1-header"
            >
              Not the account you were expecting?
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={1}>
                <span>
                  If the account you see above is not the one you want, use the
                  link below to log out of {loginData?.provider}, and then try
                  again.
                </span>
                <Box>
                  <Button variant="outlined">
                    Log out from {loginData?.provider}
                  </Button>
                </Box>
                <span>
                  If you are trying to sign up with a {loginData?.provider}{' '}
                  account that is already linked to a KBase account, you will be
                  unable to create a new KBase account using that{' '}
                  {loginData?.provider} account.
                </span>
                <span>
                  After signing out from {loginData?.provider} you will need to
                  restart the sign up process.
                </span>
                <Box>
                  <Button variant="outlined">Sign up for KBase</Button>
                </Box>
              </Stack>
            </AccordionDetails>
          </Accordion>
        </Stack>
      </Alert>
      <form onSubmit={onSubmit}>
        <Paper className={classes['account-information-panel']} elevation={0}>
          <Stack spacing={2}>
            <Typography variant="h2">Create a new KBase Account</Typography>
            <Typography>
              Some field values have been pre-populated from your{' '}
              <strong>{loginData?.provider}</strong> account.
              <strong> All fields are required.</strong>
            </Typography>
            <FormControl>
              <FormLabel htmlFor="name-input">Full Name</FormLabel>
              <TextField
                id="name-input"
                {...register('account.display', { required: true })}
                helperText="This field contains your name as you wish it to be displayed to other KBase users."
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="email-input">Email</FormLabel>
              <TextField
                id="email-input"
                {...register('account.email', {
                  required: true,
                  pattern: {
                    value:
                      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
                    message: 'Invalid email address',
                  },
                })}
                defaultValue={account.email}
                helperText="KBase may occasionally use this email address to communicate important information about KBase or your account. KBase will not share your email address with anyone, and other KBase users will not be able to see it."
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="username-input">KBase Username</FormLabel>
              <TextField
                id="username-input"
                {...register('account.username', {
                  required: true,
                  onChange: (e) => setUsername(e.currentTarget.value),
                  validate: () =>
                    !nameShort && !userAvail.isFetching && nameAvail,
                })}
                defaultValue={account.username}
                helperText={
                  <>
                    {nameShort ? (
                      <span>
                        Username is too short.
                        <br />
                      </span>
                    ) : !nameAvail && !userAvail.isFetching ? (
                      <span>
                        Username is not available. Suggested: "
                        {userAvail.currentData?.availablename}".
                        <br />
                      </span>
                    ) : undefined}
                    <span>
                      Your KBase username is the primary identifier associated
                      with all of your work and assets within KBase.Your
                      username is permanent and may not be changed later, so
                      please choose wisely.
                    </span>
                  </>
                }
                error={nameShort || (!userAvail.isFetching && !nameAvail)}
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="organization-input">Organization</FormLabel>
              <TextField
                id="organization-input"
                {...register('profile.userdata.organization', {
                  required: true,
                })}
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="department-input">Department</FormLabel>
              <TextField
                id="department-input"
                {...register('profile.userdata.department', { required: true })}
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="department-input">{surveyQuestion}</FormLabel>
              <input
                hidden
                {...register('profile.surveydata.referralSources.question')}
                value={surveyQuestion}
              />
              <FormGroup>
                {ReferalSources.map((source) => {
                  if (source.customText) {
                    return (
                      <>
                        <FormControlLabel
                          id={source.value}
                          control={
                            <Checkbox
                              {...register(
                                `profile.surveydata.referralSources.response.${source.value}`
                              )}
                            />
                          }
                          label={source.label}
                        />
                        <FormControl>
                          <TextField
                            value={optionalText[source.value]}
                            onChange={(e) => {
                              setOptionalText((s) => ({
                                ...s,
                                [source.value]: e.target.value,
                              }));
                            }}
                          />
                        </FormControl>
                      </>
                    );
                  } else {
                    return (
                      <FormControlLabel
                        control={
                          <Checkbox
                            {...register(
                              `profile.surveydata.referralSources.response.${source.value}`
                            )}
                          />
                        }
                        label={source.label}
                      />
                    );
                  }
                })}
              </FormGroup>
            </FormControl>
          </Stack>
        </Paper>
        <Stack spacing={1} direction="row">
          <Button variant="contained" size="large" type="submit">
            Continue to use policies
          </Button>
          <Button variant="contained" color="warning" size="large">
            Cancel sign up
          </Button>
        </Stack>
      </form>
    </Stack>
  );
};
