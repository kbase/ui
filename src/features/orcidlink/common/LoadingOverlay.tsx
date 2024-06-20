import { Alert, AlertTitle, CircularProgress, Modal } from '@mui/material';
import styles from './LoadingOverlay.module.scss';

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
      <div className={styles.loading}>
        <Alert icon={<CircularProgress size="1rem" />}>
          <AlertTitle>
            <span className={styles.title}>Loading...</span>
          </AlertTitle>
          <p>Loading ORCID Link</p>
        </Alert>
      </div>
    </Modal>
  );
}
