import {
  faCheckCircle,
  faTimesCircle,
  faInfoCircle,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  FormControlLabel,
  Grid,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { marked } from 'marked';
import createDOMPurify from 'dompurify';
import { FC, useEffect, useState } from 'react';
import { getMe } from '../../common/api/authService';
import { LabelValueTable } from '../../common/components/LabelValueTable';
import { useAppSelector } from '../../common/hooks';
import { ENFORCED_POLICIES, getPolicies } from '../login/Policies';
import classes from './Account.module.scss';
import { Loader } from '../../common/components';

const purify = createDOMPurify(window);

/**
 * Content for the Use Agreements tab in the Account page
 */
export const UseAgreements: FC = () => {
  const token = useAppSelector(({ auth }) => auth.token ?? '');
  const me = getMe.useQuery({ token });
  const allPolicies = getPolicies({ onlyEnforced: false });

  const userAgreed = (me.data?.policyids ?? []).map((p) => {
    const [id, version] = p.id.split('.');
    return { id, version: Number(version), agreedon: p.agreedon };
  });

  const current = userAgreed.filter(({ id, version }) => {
    if (!(id in allPolicies)) return false;
    if (!ENFORCED_POLICIES.includes(id)) return false;
    return (
      version === allPolicies[id].version ||
      allPolicies[id].equivalentVersions.includes(version)
    );
  });

  const expired = userAgreed.filter((p) => !current.includes(p));

  const currentPolicies = current
    .filter((p) => !expired.includes(p))
    .map(({ id }) => allPolicies[id]);

  const expiredPolicies = expired.map((p) => {
    const title = allPolicies[p.id]?.title ?? `Policy "${p.id}.${p.version}"`;
    return { ...p, title };
  });

  const [showExpired, setShowExpired] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<
    | (typeof currentPolicies)[number]
    | (typeof currentPolicies)[number]['olderVersions'][number]
    | undefined
  >(undefined);

  const handleChangeExpired = (
    event: React.ChangeEvent<HTMLInputElement>,
    checked: boolean
  ) => {
    setShowExpired(checked);
  };

  const handleClickPolicy = (id: string, version: number) => {
    if (version === allPolicies[id].version) setSelectedPolicy(allPolicies[id]);
    else {
      const oldVersion = allPolicies[id].olderVersions.find(
        (p) => p.version === version
      );
      if (!oldVersion) return;
      setSelectedPolicy(oldVersion);
    }
  };

  useEffect(() => {
    if (currentPolicies && selectedPolicy === undefined)
      setSelectedPolicy(currentPolicies[0]);
  }, [currentPolicies, selectedPolicy]);

  return (
    <Stack
      spacing={4}
      role="tabpanel"
      id="use-agreements-tabpanel"
      aria-labelledby="use-agreements-tab"
    >
      <Stack direction="row" justifyContent="space-between">
        <Typography variant="h2">My Policy Agreements</Typography>
        <Tooltip
          title={
            <Stack spacing={1}>
              <Typography variant="body2">
                This tab lists the Use Agreements you have agreed to during sign
                up or log in to KBase.
              </Typography>
            </Stack>
          }
        >
          <Button startIcon={<FontAwesomeIcon icon={faInfoCircle} />}>
            About this tab
          </Button>
        </Tooltip>
      </Stack>
      <Box>
        <Grid container spacing={2}>
          <Grid item sm={3}>
            <Stack spacing={2}>
              <>
                <FormControlLabel
                  control={
                    <Checkbox
                      value={showExpired}
                      onChange={handleChangeExpired}
                    />
                  }
                  label="Show expired policies"
                />
                {currentPolicies.map((policy) => {
                  return (
                    <Card
                      key={policy.title}
                      className={`${classes['policy-card']} ${
                        selectedPolicy?.id === policy.id &&
                        selectedPolicy?.version === policy.version
                          ? classes['selected-card']
                          : ''
                      }`}
                      onClick={() =>
                        handleClickPolicy(policy.id, policy.version)
                      }
                    >
                      <PolicyCardContent
                        title={policy.title}
                        isCurrent={true}
                        version={policy.version}
                        agreedDate={
                          current.find(
                            (p) =>
                              p.id === policy.id && p.version === policy.version
                          )?.agreedon
                        }
                      />
                    </Card>
                  );
                })}
                {showExpired ? (
                  expiredPolicies.map((policy) => {
                    return (
                      <Card
                        key={policy.title}
                        className={`${classes['policy-card']} ${
                          selectedPolicy?.id === policy.id &&
                          selectedPolicy?.version === policy.version
                            ? classes['selected-card']
                            : ''
                        }`}
                        onClick={() =>
                          handleClickPolicy(policy.id, policy.version)
                        }
                      >
                        <PolicyCardContent
                          title={policy.title}
                          isCurrent={false}
                          version={policy.version}
                          agreedDate={policy.agreedon}
                        />
                      </Card>
                    );
                  })
                ) : (
                  <></>
                )}
              </>
            </Stack>
          </Grid>
          <Grid item sm={9}>
            <Stack spacing={2}>
              {
                <Alert severity="info">
                  This policy is current. You have agreed to it and it applies
                  to your usage of KBase.
                </Alert>
              }
              <Paper className={classes['policy-content']}>
                {selectedPolicy ? (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: purify.sanitize(marked(selectedPolicy.markdown)),
                    }}
                  />
                ) : (
                  <Loader></Loader>
                )}
              </Paper>
            </Stack>
          </Grid>
        </Grid>
      </Box>
    </Stack>
  );
};

const PolicyCardContent = (props: {
  title: string;
  isCurrent: boolean;
  version: number;
  agreedDate?: number;
}) => {
  return (
    <CardContent>
      <Stack spacing={1}>
        <Typography variant="h5">{props.title}</Typography>
        <Box>
          {props.isCurrent && (
            <Chip
              icon={<FontAwesomeIcon icon={faCheckCircle} />}
              data-testid="current-chip"
              label="Current"
              color="info"
              size="small"
            />
          )}
          {!props.isCurrent && (
            <Chip
              icon={<FontAwesomeIcon icon={faTimesCircle} />}
              data-testid="expired-chip"
              label="Expired"
              color="error"
              size="small"
            />
          )}
        </Box>
        <div className={classes['separator']} />
        <LabelValueTable
          data={[
            {
              label: 'Version',
              value: props.version,
            },
            ...(props.agreedDate
              ? [
                  {
                    label: 'Agreed',
                    value: new Date(props.agreedDate).toLocaleDateString(),
                  },
                ]
              : []),
          ]}
        />
      </Stack>
    </CardContent>
  );
};
