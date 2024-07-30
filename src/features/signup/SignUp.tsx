import {
  Container,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from '@mui/material';
import { FC, useEffect, useState } from 'react';
import { AccountInformation } from './AccountInformation';
import { ProviderSelect } from './ProviderSelect';
import { UsePolicies } from './UsePolicies';
import { usePageTitle } from '../layout/layoutSlice';

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
  usePageTitle('Sign Up');
  const [activeStep, setActiveStep] = useState(0);

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
        {activeStep === 2 && <UsePolicies setActiveStep={setActiveStep} />}
      </Stack>
    </Container>
  );
};
