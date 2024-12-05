import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Paper, Stack, Typography } from '@mui/material';
import { FC, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { ROOT_REDIRECT_ROUTE } from '../../app/Routes';
import { Loader } from '../../common/components';
import { useAppDispatch } from '../../common/hooks';
import { kbasePolicies, PolicyViewer } from '../auth/Policies';
import { useDoSignup } from './SignUp';
import classes from './SignUp.module.scss';
import { setAccount } from './SignupSlice';

/**
 * Use policy agreements for sign up flow.
 */
export const KBasePolicies: FC<{
  setActiveStep: (step: number) => void;
}> = ({ setActiveStep }) => {
  const dispatch = useAppDispatch();

  const signupPolicies = Object.values(kbasePolicies).map((p) => p.id);
  const versionedPolicyIds = signupPolicies.map((policyId) => {
    return [kbasePolicies[policyId].id, kbasePolicies[policyId].version].join(
      '.'
    );
  });

  const [accepted, setAccepted] = useState<{
    [k in typeof signupPolicies[number]]?: boolean;
  }>({});

  const allAccepted = signupPolicies.every(
    (policyId) => accepted[policyId] === true
  );

  const [signupOk, doSignup, loading, complete, errors] = useDoSignup();
  // eslint-disable-next-line no-console
  console.error(errors);

  const onSubmit = () => {
    if (!allAccepted) return;
    dispatch(
      setAccount({
        policyids: versionedPolicyIds,
      })
    );
    doSignup(versionedPolicyIds);
  };

  if (complete) {
    return (
      <Navigate
        to={{
          pathname: ROOT_REDIRECT_ROUTE,
        }}
        replace
      />
    );
  }

  return (
    <Stack spacing={2}>
      <Paper className={classes['use-policies-panel']} elevation={0}>
        <Stack spacing={2}>
          <Typography variant="h2">KBase Use Policies</Typography>
          <Typography>
            To finish signing up and create your account, you must agree to the
            following KBase use policies.
          </Typography>
          {Object.values(kbasePolicies).map((policy) => {
            return (
              <PolicyViewer
                policyId={policy.id}
                accepted={accepted[policy.id] ?? false}
                setAccept={(val) =>
                  setAccepted((current) => {
                    return { ...current, [policy.id]: val };
                  })
                }
              />
            );
          })}
        </Stack>
      </Paper>
      <Stack spacing={1} direction="row">
        <Button
          variant="contained"
          endIcon={<Loader loading={loading} type="spinner"></Loader>}
          size="large"
          disabled={!(allAccepted && signupOk) || loading}
          onClick={onSubmit}
        >
          Create KBase account
        </Button>

        <Button
          variant="contained"
          color="warning"
          size="large"
          onClick={() => {
            setActiveStep(0);
          }}
        >
          Cancel sign up
        </Button>
        <Button
          variant="outlined"
          size="large"
          startIcon={<FontAwesomeIcon icon={faArrowLeft} />}
          onClick={() => setActiveStep(1)}
        >
          Back to account information
        </Button>
      </Stack>
    </Stack>
  );
};
