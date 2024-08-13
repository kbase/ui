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
import classes from './LogIn.module.scss';
import { usePageTitle } from '../layout/layoutSlice';

export const LogIn: FC = () => {
  usePageTitle('Log In');
  return (
    <Container className={classes['login']} maxWidth="sm">
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
            <Typography variant="h1">Log in</Typography>
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
                Continue with ORCID
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
                      className={classes['sso-logo']}
                    />
                  }
                >
                  Continue with Globus
                </Button>
              </Stack>
            </Stack>
            <Box className={classes['separator']} />
            <Typography>
              New to KBase? <Link>Sign up</Link>
            </Typography>
            <Typography>
              <Link
                href="https://docs.kbase.us/getting-started/sign-up"
                target="_blank"
              >
                Need help logging in?
              </Link>
            </Typography>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
};
