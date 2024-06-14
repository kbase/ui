import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  Link,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { FC } from 'react';
import classes from './SignUp.module.scss';

/**
 * Use policy agreements for sign up flow.
 */
export const UsePolicies: FC<{
  setActiveStep: React.Dispatch<React.SetStateAction<number>>;
}> = ({ setActiveStep }) => {
  return (
    <Stack spacing={2}>
      <Paper className={classes['use-policies-panel']} elevation={0}>
        <Stack spacing={2}>
          <Typography variant="h2">KBase Use Policies</Typography>
          <Typography>
            To finish signing up and create your account, you must agree to the
            following KBase use policies.
          </Typography>
          <FormControl>
            <Typography fontWeight="bold">KBase Use Agreement</Typography>
            <Paper className={classes['policy-panel']} elevation={0}>
              <Stack spacing={2}>
                <Typography variant="h3">Terms and Conditions</Typography>
                <Typography variant="h4">Prohibited Behavior</Typography>
                <Typography component="div">
                  As a condition of your use of KBase (the DOE Systems Biology
                  Knowledgebase) you agree not to upload any type of human data
                  or personally identifiable information.
                  <blockquote>
                    Improper use of KBase, including uploading human data, may
                    result in the termination of KBase access privileges.
                  </blockquote>
                </Typography>
                <Typography variant="h4">Data Sharing</Typography>
                <Typography>
                  KBase conforms to the{' '}
                  <Link
                    href="https://www.genomicscience.energy.gov/datasharing/"
                    target="_blank"
                  >
                    Information and Data Sharing Policy
                  </Link>{' '}
                  of the Genomic Science Program of the Office of Biological and
                  Environmental Research within the Office of Science. Please
                  see the{' '}
                  <Link
                    href="https://www.kbase.us/data-policy-and-sources/"
                    target="_blank"
                  >
                    KBase Data Policy
                  </Link>{' '}
                  page for more information.
                </Typography>
                <Typography variant="h4">Responsibility for Data</Typography>
                <Typography>
                  As a condition of your use of KBase you accept sole
                  responsibility for all files you upload or transfer through
                  use of KBase. You recognize and accept that{' '}
                  <strong>
                    KBase does not guarantee long-term retention of user
                    uploaded data
                  </strong>
                  , and will not be responsible for any failure to store or
                  transfer, or deletion, corruption or loss for any data,
                  information or content contained in your files. It is strongly
                  recommended that you back up all files prior to using KBase.
                </Typography>
                <Typography variant="h4">Use Agreement</Typography>
                <Typography>
                  By using KBase, including its websites and services or via
                  published APIs, you are agreeing to the terms stated in our{' '}
                  <Link
                    href="https://www.kbase.us/use-agreement/"
                    target="_blank"
                  >
                    Use Agreement
                  </Link>
                  . Please read them carefully. They include limitations on what
                  is acceptable user behavior, accountability, availability,
                  data retention, and conditions for account termination. If you
                  do not agree, do not access or use KBase.
                </Typography>
                <Typography variant="h4">Privacy Policy</Typography>
                <Typography>
                  KBase is provided as a public service. KBase reserves the
                  right to monitor any and all use of kbase.us. KBase never
                  collects information for commercial marketing or any purpose
                  unrelated to KBase functions. The{' '}
                  <Link
                    href="https://www.kbase.us/privacy-policy/"
                    target="_blank"
                  >
                    Privacy Policy
                  </Link>{' '}
                  describes the ways KBase collects, stores, uses, discloses and
                  protects the personal information about users and how they use
                  KBase.
                </Typography>
                <Typography variant="h4">Open Source License</Typography>
                <Typography>
                  All software developed by the KBase project team, and any
                  contributed by you to KBase, is stored and maintained in the
                  public{' '}
                  <Link href="https://github.com/kbase" target="_blank">
                    KBase GitHub code repository
                  </Link>{' '}
                  under the{' '}
                  <Link
                    href="https://github.com/kbase/project_guides/blob/master/LICENSE"
                    target="_blank"
                  >
                    MIT Open Source License
                  </Link>{' '}
                  (“License”). By contributing to or using KBase, you
                  acknowledge having read and understood the License and agree
                  to abide by it.
                </Typography>
              </Stack>
            </Paper>
            <div>
              <Box className={classes['agreement-box']}>
                <FormControlLabel
                  control={<Checkbox />}
                  label="I have read and agree to this policy"
                />
              </Box>
            </div>
          </FormControl>
          <FormControl>
            <Typography fontWeight="bold">KBase Data Policy</Typography>
            <Paper className={classes['policy-panel']} elevation={0}>
              <Stack spacing={2}>
                <Typography variant="h3">Data Policy</Typography>
                <Typography variant="h4">Data Policies</Typography>
                <Typography>
                  KBase conforms to the{' '}
                  <Link
                    href="https://www.genomicscience.energy.gov/datasharing/"
                    target="_blank"
                  >
                    Information and Data Sharing Policy
                  </Link>{' '}
                  of the Genomic Science Program of the Office of Biological and
                  Environmental Research within the Office of Science. This
                  requires that all publishable data, metadata, and software
                  resulting from research funded by the Genomic Science program
                  must conform to community-recognized standard formats when
                  they exist; be clearly attributable; and be deposited within a
                  community-recognized public database(s) appropriate for the
                  research.
                </Typography>
                <Typography>
                  <Link
                    href="https://www.kbase.us/data-policy-and-sources/"
                    target="_blank"
                  >
                    Data publicly available in KBase
                  </Link>{' '}
                  comes from the sources listed on this page. Additionally,
                  users can upload their own data to KBase to analyze it, and
                  can choose how widely their data should be shared. (All data
                  uploaded by users is private to them unless they choose to
                  share it.){' '}
                </Typography>
                <Typography>
                  <blockquote>
                    NOTICE: KBase does not guarantee long-term retention of
                    user-uploaded data. Please take appropriate precautions in
                    storing and backing up your data locally.
                  </blockquote>
                </Typography>
                <Typography>
                  <blockquote>
                    WARNING: Improper use of KBase, including uploading human
                    data, may result in the termination of KBase access
                    privileges. Please see the{' '}
                    <Link
                      href="https://www.kbase.us/terms-and-conditions/"
                      target="_blank"
                    >
                      Terms and Conditions
                    </Link>{' '}
                    page for more information.
                  </blockquote>
                </Typography>
              </Stack>
            </Paper>
            <div>
              <Box className={classes['agreement-box']}>
                <FormControlLabel
                  control={<Checkbox />}
                  label="I have read and agree to this policy"
                />
              </Box>
            </div>
          </FormControl>
        </Stack>
      </Paper>
      <Stack spacing={1} direction="row">
        <Button variant="contained" size="large">
          Create KBase account
        </Button>

        <Button variant="contained" color="warning" size="large">
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
