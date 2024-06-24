/**
 * A simple component to express a "loading" state.
 *
 * Although dubbed "loading", there is nothing specific to "loading" in this
 * component, other than the name. It is more of a generalized async process
 * feedback component, based on the MUI Alert component.
 */
import { Alert, AlertTitle, CircularProgress } from '@mui/material';
import { PropsWithChildren } from 'react';

export interface LoadingProps extends PropsWithChildren {
  title: string;
  message?: string;
}

export default function Loading({ title, message, children }: LoadingProps) {
  if (message || children) {
    return (
      <Alert color="info" icon={<CircularProgress size="1rem" />}>
        <AlertTitle>
          <span>{title}</span>
        </AlertTitle>
        {message ? <p>{message}</p> : children}
      </Alert>
    );
  }

  return (
    <Alert color="info" icon={<CircularProgress size="1rem" />}>
      <span>{title}</span>
    </Alert>
  );
}
