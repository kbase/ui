import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import {
  Button,
  FormControl,
  FormLabel,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { FC } from 'react';

/**
 * Content for the Account tab in the Account page
 */
export const AccountInfo: FC = () => {
  return (
    <Stack spacing={4}>
      <Stack direction="row" justifyContent="space-between">
        <Typography variant="h2">Edit Account</Typography>
        <Tooltip title="You may view and edit edit your basic account information here. Changes saved will be immediately available.">
          <Button startIcon={<FontAwesomeIcon icon={faInfoCircle} />}>
            About this tab
          </Button>
        </Tooltip>
      </Stack>
      <Stack spacing={2}>
        <FormControl>
          <FormLabel htmlFor="username-input">Name</FormLabel>
          <TextField
            id="username-input"
            helperText="Your real name, displayed to other KBase users"
          />
        </FormControl>
        <FormControl>
          <FormLabel htmlFor="email-input">Email</FormLabel>
          <TextField
            id="email-input"
            helperText="KBase may use this email address to communicate important information about KBase or your account. KBase will not share your email address with anyone, and other KBase users will not be able to see it."
          />
        </FormControl>
      </Stack>
      <Typography variant="h2">Account Info</Typography>
      <Stack spacing={2}>
        <Stack>
          <Typography fontWeight="bold">Username</Typography>
          <Typography>coolkbasehuman</Typography>
        </Stack>
        <Stack>
          <Typography fontWeight="bold">Account Created</Typography>
          <Typography>Apr 19, 2023 at 9:32am</Typography>
        </Stack>
        <Stack>
          <Typography fontWeight="bold">Last Sign In</Typography>
          <Typography>3 days ago (Jul 9, 2024 at 9:05am)</Typography>
        </Stack>
      </Stack>
    </Stack>
  );
};
