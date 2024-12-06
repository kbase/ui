import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Paper, Stack, Typography } from '@mui/material';
import { FC, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Loader } from '../../common/components';
import { useAppDispatch, useAppSelector } from '../../common/hooks';
import { kbasePolicies, PolicyViewer } from '../login/Policies';
import { useCheckLoginDataOk } from './AccountInformation';
import { useDoSignup } from './SignUp';
import classes from './SignUp.module.scss';
import { setAccount } from './SignupSlice';

/**
 * KBase policy agreements step for sign up flow.
 */
export const KBasePolicies: FC<{}> = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // Check prev steps data is filled out.
  useCheckLoginDataOk();
  const account = useAppSelector((state) => state.signup.account);
  useEffect(() => {
    if (Object.values(account).some((v) => v === undefined)) {
      toast('You must fill out your account information to sign up!');
      navigate('/signup/2');
    }
  }, [account, navigate]);

  // The policies the user needs to accept.
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

  // Performs signup (if all policies have been accepted)
  const [doSignup, loading] = useDoSignup();
  const onSubmit = () => {
    if (!allAccepted) return;
    dispatch(
      setAccount({
        policyids: versionedPolicyIds,
      })
    );
    doSignup(versionedPolicyIds);
  };

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
          disabled={!allAccepted || loading}
          onClick={onSubmit}
        >
          Create KBase account
        </Button>

        <Button
          variant="contained"
          color="warning"
          size="large"
          onClick={() => {
            navigate('/signup/1');
          }}
        >
          Cancel sign up
        </Button>
        <Button
          variant="outlined"
          size="large"
          startIcon={<FontAwesomeIcon icon={faArrowLeft} />}
          onClick={() => navigate('/signup/2')}
        >
          Back to account information
        </Button>
      </Stack>
    </Stack>
  );
};
