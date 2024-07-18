import {
  Alert,
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
import { useAppSelector } from '../../common/hooks';
import { useAppParam } from '../params/hooks';
import { useNavigate } from 'react-router-dom';

export const useCheckLoggedIn = () => {
  const { initialized, token } = useAppSelector((state) => state.auth);

  const navigate = useNavigate();
  if (token && initialized) {
    // TODO: handle nextrequest
    navigate('/narratives');
  }
};

export const LogIn: FC = () => {
  useCheckLoggedIn();
  const nextRequest = useAppParam('nextrequest');

  // OAuth Login wont work in dev mode, but send dev users to CI so they can grab their token
  const loginOrigin =
    process.env.NODE_ENV === 'development'
      ? 'https://ci.kbase.us'
      : document.location.origin;

  // Triggering login requires a form POST submission
  const loginActionUrl = new URL(
    '/services/auth/login/start/',
    loginOrigin
  ).toString();
  const loginState = encodeURIComponent(
    JSON.stringify({
      nextrequest: nextRequest,
      origin: loginOrigin,
    })
  );
  const loginRedirectURL = `${loginOrigin}/login/redirect?state=${loginState}`;

  return (
    <Container maxWidth="sm">
      <form action={loginActionUrl} method="post">
        <input hidden name="redirecturl" value={loginRedirectURL} />
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
              <Typography variant="h4" component="h1">
                Log in
              </Typography>
              {process.env.NODE_ENV === 'development' ? (
                <Alert severity="error">
                  DEV MODE: Login will occur on {loginOrigin}
                </Alert>
              ) : (
                <></>
              )}
              <Stack spacing={2}>
                <Button
                  name="provider"
                  value="Google"
                  type="submit"
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
                    name="provider"
                    value="Google"
                    type="submit"
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
                    name="provider"
                    value="Google"
                    type="submit"
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
      </form>
    </Container>
  );
};
