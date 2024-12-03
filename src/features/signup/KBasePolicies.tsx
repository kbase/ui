import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Paper, Stack, Typography } from '@mui/material';
import { FC, useState } from 'react';
import { PolicyViewer } from '../auth/policies';
import classes from './SignUp.module.scss';

const signupPolicies = ['kbase-user'] as const;

/**
 * Use policy agreements for sign up flow.
 */
export const KBasePolicies: FC<{
  setActiveStep: (step: number) => void;
}> = ({ setActiveStep }) => {
  const [accepted, setAccepted] = useState<{
    [k in typeof signupPolicies[number]]?: boolean;
  }>({});

  const createOk = signupPolicies.every(
    (policyId) => accepted[policyId] === true
  );

  return (
    <Stack spacing={2}>
      <Paper className={classes['use-policies-panel']} elevation={0}>
        <Stack spacing={2}>
          <Typography variant="h2">KBase Use Policies</Typography>
          <Typography>
            To finish signing up and create your account, you must agree to the
            following KBase use policies.
          </Typography>
          {signupPolicies.map((policyId) => {
            return (
              <PolicyViewer
                policyId={policyId}
                accepted={accepted[policyId] ?? false}
                setAccept={(val) =>
                  setAccepted((current) => {
                    return { ...current, policyId: val };
                  })
                }
              />
            );
          })}
        </Stack>
      </Paper>
      <Stack spacing={1} direction="row">
        <Button variant="contained" size="large" disabled={!createOk}>
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
