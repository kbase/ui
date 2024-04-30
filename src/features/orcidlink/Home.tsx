import { Alert, AlertTitle, CircularProgress } from '@mui/material';
import { SerializedError } from '@reduxjs/toolkit';
import { KBaseBaseQueryError } from '../../common/api/utils/common';
import { useAppSelector } from '../../common/hooks';
import { authUsername } from '../auth/authSlice';
import { usePageTitle } from '../layout/layoutSlice';
import ErrorMessage from './ErrorMessage';
import Linked from './Linked';
import styles from './orcidlink.module.scss';
import { orcidlinkAPI } from './orcidlinkAPI';
import Unlinked from './Unlinked';

export default function Home() {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const username = useAppSelector(authUsername)!;

  function renderLoading(title: string, description: string) {
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

  function renderError(error: KBaseBaseQueryError | SerializedError) {
    return <ErrorMessage error={error} />;
  }

  usePageTitle('KBase ORCID Link');

  const {
    data: isLInked,
    error,
    isLoading,
    isError,
    isFetching,
    isSuccess,
    isUninitialized,
  } = orcidlinkAPI.useOrcidlinkIsLinkedQuery({ username });

  if (isUninitialized) {
    return renderLoading('Uninitialized...', 'Loading the ORCID Link App...');
  } else if (isLoading) {
    return renderLoading('Loading...', 'Loading the ORCID Link App...');
  } else if (isFetching) {
    return renderLoading('Fetching...', 'Loading the ORCID Link App...');
  } else if (isError) {
    return renderError(error);
  } else if (isSuccess) {
    if (isLInked) {
      return (
        <div className={styles.box}>
          <Linked />
        </div>
      );
    }
    return (
      <div className={styles.box}>
        <Unlinked />
      </div>
    );
  } else {
    return <div>???</div>;
  }
}
