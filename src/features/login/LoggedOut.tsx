import {
  Box,
  Button,
  Container,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { useCheckLoggedIn } from './LogIn';
import orcidLogo from '../../common/assets/orcid.png';
import globusLogo from '../../common/assets/globus.png';
import googleLogo from '../../common/assets/google.webp';
import providerClasses from '../auth/providers.module.scss';

export const LoggedOut = () => {
  useCheckLoggedIn(undefined);

  return (
    <Container maxWidth="sm">
      <Stack spacing={2} textAlign="center">
        <Paper
          elevation={0}
          sx={{
            padding: 2,
          }}
        >
          <Stack spacing={2}>
            <Typography variant="h4" component="h1">
              You are signed out of KBase
            </Typography>
            <Typography fontStyle="italic">
              You may still be logged in to your identity provider. If you wish
              to ensure that your KBase account is inaccessible from this
              browser, you should sign out of any provider accounts you have
              used to access KBase.
            </Typography>
            <Box className={providerClasses['separator']} />
            <Stack spacing={1}>
              <Button
                role="link"
                href="https://www.orcid.org/signout"
                variant="outlined"
                color="base"
                size="large"
                startIcon={
                  <img
                    src={orcidLogo}
                    alt="ORCID logo"
                    className={providerClasses['sso-logo']}
                  />
                }
              >
                Log out from ORCID
              </Button>
              <Button
                role="link"
                href="https://accounts.google.com/Logout"
                variant="outlined"
                color="base"
                size="large"
                startIcon={
                  <img
                    src={googleLogo}
                    alt="Google logo"
                    className={providerClasses['sso-logo']}
                  />
                }
              >
                Log out from Google
              </Button>
              <Button
                role="link"
                href="https://app.globus.org/logout"
                variant="outlined"
                color="base"
                size="large"
                startIcon={
                  <img
                    src={globusLogo}
                    alt="Globus logo"
                    className={providerClasses['sso-logo']}
                  />
                }
              >
                Log out from Globus
              </Button>
            </Stack>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
};
