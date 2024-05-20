import { Alert, AlertTitle, CircularProgress, Modal } from '@mui/material';
import styles from './LoadingOverlay.module.scss';

export interface LoadingAlertProps {
  title: string;
  description: string;
}

/**
 * A wrapper around MUI Alert to show a loading indicator (spinner) and message,
 * with a description.
 */
export function LoadingAlert({ title, description }: LoadingAlertProps) {
  return (
    <div className={styles.loading}>
      <Alert icon={<CircularProgress size="1rem" />}>
        <AlertTitle>
          <span className={styles['loading-title']}>{title}</span>
        </AlertTitle>
        <p>{description}</p>
      </Alert>
    </div>
  );
}

export interface LoadingOverlayProps {
  open: boolean;
}

/**
 * Displays a model containing a loading alert as defined above, for usage in
 * covering and blocking the screen while a process is in progress.
 */
export default function LoadingOverlay({ open }: LoadingOverlayProps) {
  return (
    <Modal open={open} disableAutoFocus={true}>
      <LoadingAlert title="Loading..." description="Loading ORCID Link" />
    </Modal>
  );
}
