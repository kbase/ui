import { Typography } from '@mui/material';

/**
 * Should be used to indicate that an ORCID profile field has been made private
 * by the owner, and may not be viewed by anyone else.
 *
 */
export default function PrivateField() {
  return <Typography fontStyle="italic">private</Typography>;
}
