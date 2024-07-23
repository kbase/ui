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
import { FC, useEffect, useState } from 'react';
import { LabelValueTable } from '../../common/components/LabelValueTable';
import classes from './Account.module.scss';

interface Policy {
  name: string;
  publishedDate: string;
  agreedDate: string;
  version: number;
  isCurrent: boolean;
  content: string;
}

/**
 * Dummy data for the log in sessions table.
 * Can be deleted once table is linked to backend.
 */
const samplePolicies: Policy[] = [
  {
    name: 'KBase Use Agreement',
    publishedDate: 'Jul 1, 2024	',
    agreedDate: 'Jul 9, 2024	',
    version: 1,
    isCurrent: true,
    content:
      'Quis veniam dolor ex aliqua ullamco incididunt commodo commodo nulla. Adipisicing id dolor elit aliquip laborum aliquip ad exercitation qui dolor eu exercitation cillum. Magna voluptate ut voluptate non esse sunt esse nostrud. Labore cillum esse ex dolor aliqua do culpa eu et mollit do reprehenderit id cupidatat.',
  },
  {
    name: 'KBase Data Policy',
    publishedDate: 'Jul 1, 2024	',
    agreedDate: 'Jul 9, 2024',
    version: 1,
    isCurrent: true,
    content:
      'Irure qui dolor ut enim culpa nulla aute nostrud deserunt commodo ad sit ut non. Ullamco velit laboris sint laboris dolore velit Lorem. Dolore sit ea sint quis Lorem laborum exercitation non voluptate. Enim sint velit anim et anim enim consequat exercitation labore aliquip mollit proident. Do pariatur elit excepteur mollit labore irure cillum tempor commodo proident proident. Et nostrud esse sunt ipsum est reprehenderit elit ex proident. Sit ipsum magna eu quis est commodo incididunt.',
  },
  {
    name: 'KBase Data Policy',
    publishedDate: 'Jul 1, 2024	',
    agreedDate: 'Jul 9, 2024',
    version: 0,
    isCurrent: false,
    content:
      'Id amet aliqua mollit ex consectetur esse ex. Aute culpa cillum sint ullamco anim. Aliquip sunt qui enim exercitation irure in. Aliqua exercitation qui aliquip ex ut ullamco nulla ea exercitation. Consectetur duis aliqua ad dolore occaecat velit proident eiusmod fugiat.',
  },
];

/**
 * Content for the Use Agreements tab in the Account page
 */
export const UseAgreements: FC = () => {
  const currentPolicies = samplePolicies.filter((d) => d.isCurrent === true);
  const [policies, setPolicies] = useState(currentPolicies);
  const [showExpired, setShowExpired] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState(policies[0]);

  const handleChangeExpired = (
    event: React.ChangeEvent<HTMLInputElement>,
    checked: boolean
  ) => {
    setShowExpired(checked);
  };

  const handleClickPolicy = (policy: Policy) => {
    setSelectedPolicy(policy);
  };

  useEffect(() => {
    if (showExpired) {
      setPolicies(samplePolicies);
    } else {
      setPolicies(currentPolicies);
    }
  }, [showExpired, currentPolicies]);

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
              <FormControlLabel
                control={
                  <Checkbox
                    value={showExpired}
                    onChange={handleChangeExpired}
                  />
                }
                label="Show expired policies"
              />
              {policies.map((policy) => (
                <Card
                  key={policy.name}
                  className={`${classes['policy-card']} ${
                    selectedPolicy.name === policy.name &&
                    selectedPolicy.version === policy.version
                      ? classes['selected-card']
                      : ''
                  }`}
                  onClick={() => handleClickPolicy(policy)}
                >
                  <CardContent>
                    <Stack spacing={1}>
                      <Typography variant="h5">{policy.name}</Typography>
                      <Box>
                        {policy.isCurrent && (
                          <Chip
                            icon={<FontAwesomeIcon icon={faCheckCircle} />}
                            label="Current"
                            color="info"
                            size="small"
                          />
                        )}
                        {!policy.isCurrent && (
                          <Chip
                            icon={<FontAwesomeIcon icon={faTimesCircle} />}
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
                            value: policy.version,
                          },
                          {
                            label: 'Published',
                            value: policy.publishedDate,
                          },
                          {
                            label: 'Agreed',
                            value: policy.agreedDate,
                          },
                        ]}
                      />
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </Grid>
          <Grid item sm={9}>
            <Stack spacing={2}>
              {selectedPolicy.isCurrent && (
                <Alert severity="info">
                  This policy is current. You have agreed to it and it applies
                  to your usage of KBase.
                </Alert>
              )}
              {!selectedPolicy.isCurrent && (
                <Alert severity="error">
                  This policy is expired. There is a newer policy that applies
                  to your usage of KBase.
                </Alert>
              )}
              <Paper className={classes['policy-content']}>
                {selectedPolicy.content}
              </Paper>
            </Stack>
          </Grid>
        </Grid>
      </Box>
    </Stack>
  );
};
