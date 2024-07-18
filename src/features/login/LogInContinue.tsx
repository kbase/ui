import { Container, Paper, Stack, Typography } from '@mui/material';
import { FC, useEffect } from 'react';
import logoRectangle from '../../common/assets/logo/rectangle.png';
import classes from './LogIn.module.scss';
import { Loader } from '../../common/components';
import { useCookie } from '../../common/cookie';
import { getLoginChoice, postLoginPick } from '../../common/api/authService';
import { useTryAuthFromToken } from '../auth/hooks';
import { useCheckLoggedIn } from './LogIn';

export const LogInContinue: FC = () => {
  // redirect if/when login is completed
  useCheckLoggedIn();

  const [loginProcessToken] = useCookie('in-process-login-token');

  const { data: choiceData } = getLoginChoice.useQuery(undefined, {
    skip: !loginProcessToken,
  });

  const [trigger, result] = postLoginPick.useMutation();

  // if/when postLoginPick has a result, update app auth state using that token
  useTryAuthFromToken(result.data?.token.token);

  // wrap choiceData handling in an effect so we only trigger the pick call once
  useEffect(() => {
    if (choiceData) {
      const accountExists = choiceData.login.length > 0;
      // TODO: support choiceData.create cases
      if (accountExists) {
        if (choiceData.login.length > 1) {
          // needs to be implemented if we have multiple KBase accounts linked to one provider account
        } else {
          trigger({
            id: choiceData.login[0].id,
            policyids: choiceData.login[0].policyids.map(({ id }) => id),
          });
        }
      }
    }
  }, [choiceData, trigger]);

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
            <Typography variant="h4" component="h1">
              <Loader /> Logging in
            </Typography>
            <pre>{JSON.stringify(result.data || choiceData, null, 4)}</pre>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
};
