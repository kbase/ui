import {
  Container,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from '@mui/material';
import { FC, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { loginCreate } from '../../common/api/authService';
import { setUserProfile } from '../../common/api/userProfileApi';
import { useAppSelector } from '../../common/hooks';
import { useTryAuthFromToken } from '../auth/hooks';
import { AccountInformation } from './AccountInformation';
import { ProviderSelect } from './ProviderSelect';
import { KBasePolicies } from './SignupPolicies';
import { md5 } from 'js-md5';
import { ROOT_REDIRECT_ROUTE } from '../../app/Routes';

const signUpSteps = [
  'Sign up with a supported provider',
  'Account information',
  'KBase use policies',
];

/**
 * Sign up flow that handles choosing a provider, populating account information,
 * and accepting the KBase use policies.
 */
export const SignUp: FC = () => {
  const navigate = useNavigate();

  const { step = '1' } = useParams();
  const activeStep = Number.parseInt(step) - 1;

  const setActiveStep = (step: number) => {
    navigate(`/signup/${step + 1}`);
  };

  useEffect(() => {
    document.querySelector('main')?.scrollTo(0, 0);
  }, [activeStep]);

  return (
    <Container maxWidth="lg">
      <Stack spacing={4}>
        <Typography variant="h1">Sign up for KBase</Typography>
        <Stepper activeStep={activeStep}>
          {signUpSteps.map((step, i) => (
            <Step
              key={step}
              onClick={() => {
                if (i < activeStep) setActiveStep(i);
              }}
            >
              <StepLabel>{step}</StepLabel>
            </Step>
          ))}
        </Stepper>
        {activeStep === 0 && <ProviderSelect />}
        {activeStep === 1 && <AccountInformation />}
        {activeStep === 2 && <KBasePolicies />}
      </Stack>
    </Container>
  );
};

export const useDoSignup = () => {
  const signupData = useAppSelector((state) => state.signup);
  const navigate = useNavigate();

  // Queries for creating an account and a profile for the user.
  const [triggerCreateAccount, accountResult] = loginCreate.useMutation();
  const [triggerCreateProfile, profileResult] = setUserProfile.useMutation();
  const error = accountResult.error || profileResult.error;

  // Callback to trigger the first call. Consumer should check signup data is present before calling!
  const doSignup = (policyIds: string[]) => {
    triggerCreateAccount({
      id: String(signupData.loginData?.create[0].id),
      user: String(signupData.account.username),
      display: String(signupData.account.display),
      email: String(signupData.account.email),
      policyids: policyIds,
      linkall: false,
    });
  };

  // Once the account is created, use the account token to set the account profile.
  useEffect(() => {
    if (!accountResult.data?.token.token) return;
    triggerCreateProfile([
      {
        profile: {
          user: {
            realname: String(signupData.account.display),
            username: String(signupData.account.username),
          },
          profile: {
            metadata: {
              createdBy: 'ui_europa',
              created: new Date().toISOString(),
            },
            // was globus info, no longer used
            preferences: {},
            synced: {
              gravatarHash: gravatarHash(signupData.account.email || ''),
            },
            ...signupData.profile,
          },
        },
      },
      accountResult.data?.token.token ?? '',
    ]);
  }, [
    accountResult,
    signupData.account.display,
    signupData.account.email,
    signupData.account.username,
    signupData.profile,
    triggerCreateProfile,
  ]);

  const createLoading =
    !accountResult.isUninitialized &&
    (accountResult.isLoading || profileResult.isLoading);

  const createComplete =
    !createLoading &&
    !accountResult.isUninitialized &&
    !profileResult.isUninitialized &&
    accountResult.isSuccess &&
    profileResult.isSuccess;

  // Once create completes, try auth from token.
  const tryToken = createComplete ? accountResult.data.token.token : undefined;
  const tokenQuery = useTryAuthFromToken(tryToken);

  const complete = createComplete && tokenQuery.isSuccess;
  const loading = createLoading || !complete;

  // once everything completes and we're authed from the token, redirect to root.
  useEffect(() => {
    if (complete) navigate(ROOT_REDIRECT_ROUTE);
  }, [complete, navigate]);

  return [doSignup, loading, complete, error] as const;
};

const gravatarHash = (email: string) => {
  return md5.create().update(email.trim().toLowerCase()).hex();
};
