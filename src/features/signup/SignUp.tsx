import {
  Box,
  Button,
  Container,
  Link,
  Paper,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from '@mui/material';
import { FC } from 'react';
import orcidLogo from '../../common/assets/orcid.png';
import globusLogo from '../../common/assets/globus.png';
import googleLogo from '../../common/assets/google.webp';
import classes from './SignUp.module.scss';

export const SignUp: FC = () => {
  return (
    <Container maxWidth="lg">
      <Stack spacing={4}>
        <Typography variant="h1">Sign up for KBase</Typography>
        <Stepper>
          <Step>
            <StepLabel>Sign up with a supported provider</StepLabel>
          </Step>
          <Step>
            <StepLabel>Account information</StepLabel>
          </Step>
          <Step>
            <StepLabel>KBase use policies</StepLabel>
          </Step>
        </Stepper>
        <Stack justifyContent="center">
          <Container maxWidth="sm">
            <Paper className={classes['signup-panel']} elevation={0}>
              <Stack spacing={2}>
                <Typography variant="h2">Choose a provider</Typography>
                <Stack spacing={2}>
                  <Button
                    variant="outlined"
                    color="base"
                    size="large"
                    startIcon={
                      <img
                        src={orcidLogo}
                        alt="ORCID logo"
                        className={classes['sso-logo']}
                      />
                    }
                  >
                    Sign up with ORCID
                  </Button>
                  <Box className={classes['separator']} />
                  <Stack spacing={1}>
                    <Button
                      variant="outlined"
                      color="base"
                      size="large"
                      startIcon={
                        <img
                          src={googleLogo}
                          alt="Google logo"
                          className={classes['sso-logo']}
                        />
                      }
                    >
                      Sign up with Google
                    </Button>
                    <Button
                      variant="outlined"
                      color="base"
                      size="large"
                      startIcon={
                        <img
                          src={globusLogo}
                          alt="Globus logo"
                          className={classes['sso-logo']}
                        />
                      }
                    >
                      Sign up with Globus
                    </Button>
                  </Stack>
                </Stack>
                <Box className={classes['separator']} />
                <Typography>
                  Already have an account? <Link>Log in</Link>
                </Typography>
                <Typography>
                  <Link
                    href="https://docs.kbase.us/getting-started/sign-up"
                    target="_blank"
                  >
                    Need help signing up?
                  </Link>
                </Typography>
              </Stack>
            </Paper>
          </Container>
        </Stack>
      </Stack>
    </Container>
  );
};
