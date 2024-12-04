import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Alert, Button, Container, Paper } from '@mui/material';
import { Stack } from '@mui/system';
import { useState } from 'react';
import classes from '../signup/SignUp.module.scss';
import { kbasePolicies, PolicyViewer } from '../auth/Policies';

export const EnforcePolicies = ({
  policyIds,
  onAccept,
}: {
  policyIds: string[];
  onAccept: (versionedPolicyIds: string[]) => void;
}) => {
  const targetPolicies = policyIds.map((id) => kbasePolicies[id]);

  const [accepted, setAccepted] = useState<{
    [k in typeof targetPolicies[number]['id']]?: boolean;
  }>({});

  const allAccepted = targetPolicies.every(
    (policy) => accepted[policy.id] === true
  );

  return (
    <Container maxWidth="lg">
      <Paper className={classes['use-policies-panel']} elevation={0}>
        <Stack spacing={2}>
          <Alert severity="warning" variant="filled">
            To continue using your account, you must agree to the following
            KBase use policies.
          </Alert>
          {targetPolicies.map((policy) => {
            return (
              <PolicyViewer
                policyId={policy.id}
                accepted={accepted[policy.id] ?? false}
                setAccept={(val: boolean) =>
                  setAccepted((current) => {
                    return { ...current, [policy.id]: val };
                  })
                }
              />
            );
          })}
        </Stack>
        <Stack spacing={2} direction="row">
          <Button
            variant="contained"
            size="large"
            type="submit"
            endIcon={<FontAwesomeIcon icon={faArrowRight} />}
            disabled={!allAccepted}
            onClick={() =>
              onAccept(
                targetPolicies.map((policy) => {
                  return [policy.id, policy.version].join('.');
                })
              )
            }
          >
            Agree and Continue
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
};
