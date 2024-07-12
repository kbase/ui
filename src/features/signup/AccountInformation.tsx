import { faAngleRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { FC } from 'react';
import classes from './SignUp.module.scss';

/**
 * Account information form for sign up flow
 */
export const AccountInformation: FC<{
  setActiveStep: React.Dispatch<React.SetStateAction<number>>;
}> = ({ setActiveStep }) => {
  return (
    <Stack spacing={2}>
      <Alert>
        <Stack spacing={1}>
          <span>
            You have signed in with your <strong>Google</strong> account{' '}
            <strong>coolkbasehuman@lbl.gov</strong>. This will be the account
            linked to your KBase account.
          </span>
          <Accordion className={classes['collapsible-message']} disableGutters>
            <AccordionSummary
              expandIcon={<FontAwesomeIcon icon={faAngleRight} />}
              aria-controls="panel1-content"
              id="panel1-header"
            >
              Not the account you were expecting?
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={1}>
                <span>
                  If the account you see above is not the one you want, use the
                  link below to log out of Google, and then try again.
                </span>
                <Box>
                  <Button variant="outlined">Log out from Google</Button>
                </Box>
                <span>
                  If you are trying to sign up with a Google account that is
                  already linked to a KBase account, you will be unable to
                  create a new KBase account using that Google account.
                </span>
                <span>
                  After signing out from Google you will need to restart the
                  sign up process.
                </span>
                <Box>
                  <Button variant="outlined">Sign up for KBase</Button>
                </Box>
              </Stack>
            </AccordionDetails>
          </Accordion>
        </Stack>
      </Alert>
      <Paper className={classes['account-information-panel']} elevation={0}>
        <Stack spacing={2}>
          <Typography variant="h2">Create a new KBase Account</Typography>
          <Typography>
            Some field values have been pre-populated from your{' '}
            <strong>Google</strong> account.
            <strong> All fields are required.</strong>
          </Typography>
          <FormControl>
            <FormLabel htmlFor="name-input">Full Name</FormLabel>
            <TextField
              id="name-input"
              helperText="This field contains your name as you wish it to be displayed to other KBase users."
            />
          </FormControl>
          <FormControl>
            <FormLabel htmlFor="email-input">Email</FormLabel>
            <TextField
              id="email-input"
              helperText="KBase may occasionally use this email address to communicate important information about KBase or your account. KBase will not share your email address with anyone, and other KBase users will not be able to see it."
            />
          </FormControl>
          <FormControl>
            <FormLabel htmlFor="username-input">KBase Username</FormLabel>
            <TextField
              id="username-input"
              helperText="Your KBase username is the primary identifier associated with all of your work and assets within KBase.Your username is permanent and may not be changed later, so please choose wisely."
            />
          </FormControl>
          <FormControl>
            <FormLabel htmlFor="organization-input">Organization</FormLabel>
            <TextField id="organization-input" />
          </FormControl>
          <FormControl>
            <FormLabel htmlFor="department-input">Department</FormLabel>
            <TextField id="department-input" />
          </FormControl>
          <FormControl>
            <FormLabel htmlFor="department-input">
              How did you hear about us? (Select all that apply)
            </FormLabel>
            <FormGroup>
              <FormControlLabel
                control={<Checkbox />}
                label="Journal Publication"
              />
              <FormControlLabel
                control={<Checkbox />}
                label="Conference Presentation"
              />
              <FormControlLabel
                control={<Checkbox />}
                label="Workshop/Webinar"
              />
              <FormControlLabel control={<Checkbox />} label="Colleague" />
              <FormControlLabel
                control={<Checkbox />}
                label="Course/Instructor"
              />
              <FormControlLabel
                control={<Checkbox />}
                label="Newsletter/Email"
              />
              <FormControlLabel control={<Checkbox />} label="YouTube" />
              <FormControlLabel control={<Checkbox />} label="Twitter" />
              <FormControlLabel control={<Checkbox />} label="Search Engine" />
              <FormControlLabel
                control={<Checkbox />}
                label="Online Advertisement"
              />
              <FormControlLabel control={<Checkbox />} label="Other" />
            </FormGroup>
          </FormControl>
        </Stack>
      </Paper>
      <Stack spacing={1} direction="row">
        <Button
          variant="contained"
          size="large"
          onClick={() => setActiveStep(2)}
        >
          Continue to use policies
        </Button>
        <Button variant="contained" color="warning" size="large">
          Cancel sign up
        </Button>
      </Stack>
    </Stack>
  );
};
