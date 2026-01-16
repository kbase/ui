import {
  Alert,
  Box,
  Container,
  Link,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { FC } from 'react';
import { LOGIN_ROUTE } from '../../app/Routes';
import { ProviderButtons } from '../auth/providers';
import { makeAuthFlowURLs } from '../auth/utils';
import classes from './SignUp.module.scss';

const { actionUrl, redirectUrl, loginOrigin } = makeAuthFlowURLs(
  'login',
  'login/continue'
);

/**
 * Provider selection screen for sign up flow
 */
export const ProviderSelect: FC = () => {
  return (
    <Stack justifyContent="center">
      <Container maxWidth="sm">
        <Paper className={classes['signup-panel']} elevation={0}>
          <Stack spacing={2}>
            <Typography variant="h2">Choose a provider</Typography>
            {import.meta.env.MODE === 'development' ? (
              <Alert severity="error">
                DEV MODE: Signup will occur on {loginOrigin}
              </Alert>
            ) : (
              <></>
            )}
            <form action={actionUrl.toString()} method="post">
              <ProviderButtons
                text={(provider) => `Sign up with ${provider}`}
              />
              <input
                readOnly
                hidden
                name="redirecturl"
                value={redirectUrl.toString()}
                data-testid="redirecturl"
              />
            </form>
            <Box className={classes['separator']} />
            <Typography>
              Already have an account? <Link href={LOGIN_ROUTE}>Log in</Link>
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
  );
};
