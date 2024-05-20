import { Typography } from '@mui/material';

/**
 * Simply a common component to use in place of an empty space for a field which
 * is absent or empty.
 */
export default function NA() {
  return (
    <Typography fontStyle="italic" variant="body1">
      n/a
    </Typography>
  );
}
