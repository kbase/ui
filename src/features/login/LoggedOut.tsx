import { Box, Container, Paper, Stack, Typography } from '@mui/material';
import { useCheckLoggedIn } from './LogIn';
import providerClasses from '../auth/providers.module.scss';
import { ProviderButtons } from '../auth/providers';

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
            <ProviderButtons
              text={(provider) => `Log out from ${provider}`}
              href={(provider) =>
                ({
                  ORCID: 'https://www.orcid.org/signout',
                  Google: 'https://accounts.google.com/Logout',
                  Globus: 'https://app.globus.org/logout',
                }[provider])
              }
            />
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
};
