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
import { AccountInformation } from './AccountInformation';
import { ProviderSelect } from './ProviderSelect';
import { KBasePolicies } from './KBasePolicies';

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
