import {
  Box,
  Button,
  Container,
  Link,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { FC } from 'react';
import logoRectangle from '../../common/assets/logo/rectangle.png';
import orcidLogo from '../../common/assets/orcid.png';
import globusLogo from '../../common/assets/globus.png';
import googleLogo from '../../common/assets/google.webp';
import classes from './SignIn.module.scss';

export const SignIn: FC = () => {
  return (
    <Container maxWidth="sm">
      <Stack spacing={2} textAlign="center">
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          justifyContent="center"
        >
          <img
            src={logoRectangle}
            alt="KBase circles logo"
            className={classes['logo']}
          />
        </Stack>
        <Typography fontStyle="italic">
          A collaborative, open environment for systems biology of plants,
          microbes and their communities.
        </Typography>
        <Paper
          elevation={0}
          sx={{
            padding: 2,
          }}
        >
          <Stack spacing={2}>
            <Stack spacing={1}>
              <Typography variant="h4" component="h1">
                Sign in
              </Typography>
              <Button
                variant="outlined"
                color="base"
                size="large"
                startIcon={
                  <img
                    src={orcidLogo}
                    alt="ORCID logo"
                    style={{ height: '2.5rem', width: 'auto' }}
                  />
                }
              >
                Continue with ORCID
              </Button>
              <Button
                variant="outlined"
                color="base"
                size="large"
                startIcon={
                  <img
                    src={googleLogo}
                    alt="Google logo"
                    style={{ height: '2.5rem', width: 'auto' }}
                  />
                }
              >
                Continue with Google
              </Button>
              <Button
                variant="outlined"
                color="base"
                size="large"
                startIcon={
                  <img
                    src={globusLogo}
                    alt="Globus logo"
                    style={{ height: '2.5rem', width: 'auto' }}
                  />
                }
              >
                Continue with Globus
              </Button>
            </Stack>
            <Box
              sx={{
                alignSelf: 'center',
                backgroundColor: 'grey.400',
                height: '1px',
                width: '80%',
              }}
            />
            <Typography>
              New to KBase? <Link>Sign up</Link>
            </Typography>
            <Typography>
              <Link
                href="https://docs.kbase.us/getting-started/sign-up"
                target="_blank"
              >
                Need help signing in?
              </Link>
            </Typography>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
};
