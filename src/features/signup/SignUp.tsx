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
            <Step key={step} onClick={() => setActiveStep(i)}>
              <StepLabel>{step}</StepLabel>
            </Step>
          ))}
        </Stepper>
        {activeStep === 0 && <ProviderSelect />}
        {activeStep === 1 && (
          <AccountInformation setActiveStep={setActiveStep} />
        )}
        {activeStep === 2 && <KBasePolicies setActiveStep={setActiveStep} />}
      </Stack>
    </Container>
  );
};

export const useDoSignup = () => {
  const data = useAppSelector((state) => state.signup);

  const signupOk = !!data.loginData;
  const [triggerAccount, accountResult] = loginCreate.useMutation();
  const [triggerProfile, profileResult] = setUserProfile.useMutation();

  const loading =
    !accountResult.isUninitialized &&
    (accountResult.isLoading || profileResult.isLoading);

  const complete =
    !loading &&
    !accountResult.isUninitialized &&
    !profileResult.isUninitialized &&
    accountResult.isSuccess &&
    profileResult.isSuccess;

  const error = accountResult.error || profileResult.error;

  const doSignup = async () => {
    if (!signupOk) return;
    triggerAccount({
      id: String(data.loginData?.create[0].id),
      user: String(data.account.username),
      display: String(data.account.display),
      email: String(data.account.email),
      policyids: data.account.policyids,
      linkall: false,
    });
  };

  useEffect(() => {
    triggerProfile([
      {
        profile: {
          user: {
            realname: String(data.account.display),
            username: String(data.account.username),
          },
          profile: {
            metadata: {
              createdBy: 'ui_europa',
              created: new Date().toISOString(),
            },
            // was globus info, no longer used
            preferences: {},
            synced: {
              gravatarHash: gravatarHash(data.account.email || ''),
            },
            ...data.profile,
          },
        },
      },
      accountResult.data?.token.token ?? '',
    ]);
  }, [
    accountResult,
    data.account.display,
    data.account.email,
    data.account.username,
    data.profile,
    triggerProfile,
  ]);

  // Once everything completes, try auth from token.
  const tryToken = complete ? accountResult.data.token.token : undefined;
  useTryAuthFromToken(tryToken);

  return [signupOk, doSignup, loading, complete, error] as const;
};

const gravatarHash = (email: string) => {
  return md5.create().update(email.trim().toLowerCase()).hex();
};
