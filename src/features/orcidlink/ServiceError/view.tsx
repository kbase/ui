/**
 * The "view" component for the ServiceError component.
 *
 * It should display the provided orcidlink service error code and message.
 *
 * TODO: when the controller fetches the error definition, that will be
 * displayed as well.
 */

import { Alert, AlertTitle } from '@mui/material';

export interface ORCIDLinkServiceErrorProps {
  code: string;
  message: string;
}

export default function ORCIDLinkServiceError({
  code,
  message,
}: ORCIDLinkServiceErrorProps) {
  return (
    <Alert color="error">
      <AlertTitle>Code: {code}</AlertTitle>
      {message}
    </Alert>
  );
}
