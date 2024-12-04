import { Container, Paper, Stack, Typography } from '@mui/material';
import { FC, useEffect, useMemo, useState } from 'react';
import logoRectangle from '../../common/assets/logo/rectangle.png';
import classes from './LogIn.module.scss';
import { Loader } from '../../common/components';
import { getLoginChoice, postLoginPick } from '../../common/api/authService';
import { useTryAuthFromToken } from '../auth/hooks';
import { useCheckLoggedIn } from './LogIn';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { LOGIN_ROUTE } from '../../app/Routes';
import { useAppDispatch } from '../../common/hooks';
import { setLoginData } from '../signup/SignupSlice';
import { kbasePolicies } from '../auth/Policies';
import { EnforcePolicies } from './EnforcePolicies';

export const LogInContinue: FC = () => {
  const [triggerPick, pickResult] = postLoginPick.useMutation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // Redirect logic is somewhat odd due to how state must be passed with the Auth service.
  // Instead of redirecting to redirecturl, we extract the state param and from that, which
  // contains the stored nextRequest value.

  let nextRequest: string | undefined = undefined;
  const redirecturl = pickResult.data?.redirecturl;
  if (redirecturl) {
    const stateParam = new URL(redirecturl).searchParams.get('state');
    if (stateParam) {
      const stateObj = JSON.parse(stateParam);
      if (
        stateObj &&
        'nextRequest' in stateObj &&
        typeof stateObj.nextRequest === 'string'
      ) {
        nextRequest = stateObj.nextRequest;
      }
    }
  }

  // redirect if/when login is completed
  useCheckLoggedIn(nextRequest);

  const choiceResult = getLoginChoice.useQuery();
  const choiceData = choiceResult.data;

  const policyids = choiceData?.login[0]?.policyids;
  // Check for missing policies
  const missingPolicies = useMemo(
    () =>
      Object.values(kbasePolicies).filter((policy) => {
        const policyVersionsOk = [
          policy.version,
          ...policy.equivalentVersions,
        ].map((version) => `${policy.id}.${version}`);
        return !policyids?.find((policy) =>
          policyVersionsOk.find((policyVersion) => policyVersion === policy.id)
        );
      }),
    [policyids]
  );
  const [agreedPolicyIds, setAgreedPolicyIds] = useState<string[]>([]);
  const allNewPolicyAgreed = missingPolicies.every((p) =>
    agreedPolicyIds.includes([p.id, p.version].join('.'))
  );

  // if/when postLoginPick has a result, update app auth state using that token
  const tokenResult = useTryAuthFromToken(pickResult.data?.token.token);

  // wrap choiceData handling in an effect so we only triggerPick the pick call once
  useEffect(() => {
    if (choiceData) {
      const accountExists = choiceData.login.length > 0;
      // TODO: support policy enforcement
      if (accountExists) {
        if (choiceData.login.length > 1) {
          // needs to be implemented if we have multiple KBase accounts linked to one provider account
        } else {
          if (allNewPolicyAgreed) {
            const existingPolicyIds = choiceData.login[0]?.policyids.map(
              ({ id }) => id
            );
            triggerPick({
              id: choiceData.login[0]?.id,
              policyids: [...agreedPolicyIds, ...existingPolicyIds],
            });
          }
        }
      } else if (choiceData.create.length > 0) {
        dispatch(setLoginData(choiceData));
        navigate('/signup/2');
      }
    }
  }, [
    choiceData,
    triggerPick,
    dispatch,
    navigate,
    allNewPolicyAgreed,
    agreedPolicyIds,
  ]);

  useEffect(() => {
    // Monitor error state, return to login
    if (!pickResult.isError && !choiceResult.isError && !tokenResult.isError) {
      return;
    } else {
      // eslint-disable-next-line no-console
      console.error({
        'login error(s)': {
          pick: pickResult.error,
          choice: choiceResult.error,
          token: tokenResult.error,
        },
      });
      toast('An error occured during login, please try again.');
      navigate(LOGIN_ROUTE);
    }
  }, [
    choiceResult.error,
    choiceResult.isError,
    navigate,
    pickResult.error,
    pickResult.isError,
    tokenResult.error,
    tokenResult.isError,
  ]);

  if (!allNewPolicyAgreed) {
    return (
      <EnforcePolicies
        policyIds={missingPolicies.map((p) => p.id)}
        onAccept={(accepted) => {
          setAgreedPolicyIds([...accepted]);
        }}
      />
    );
  }

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
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
};
