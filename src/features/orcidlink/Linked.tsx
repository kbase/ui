import { Alert, AlertTitle, CircularProgress } from '@mui/material';
import { SerializedError } from '@reduxjs/toolkit';
import { orcidlinkAPI, OwnerLinkResult } from '../../common/api/orcidlinkAPI';
import { KBaseBaseQueryError } from '../../common/api/utils/common';
import { useAppSelector } from '../../common/hooks';
import { authUsername } from '../auth/authSlice';
import ErrorMessage from './ErrorMessage';
import styles from './orcidlink.module.scss';

export default function Linked() {
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

  function renderLink(data: OwnerLinkResult) {
    return (
      <div>
        <p>Congratulations! You do indeed have an ORCID Link</p>
        <div className={styles['prop-table']}>
          <div>
            <div>Username</div>
            <div>{data.username}</div>
          </div>
          <div>
            <div>ORCID Id</div>
            <div>{data.orcid_auth.orcid}</div>
          </div>
          <div>
            <div>Name at ORCID</div>
            <div>{data.orcid_auth.name}</div>
          </div>
        </div>
      </div>
    );
  }

  function renderError(error: KBaseBaseQueryError | SerializedError) {
    return <ErrorMessage error={error} />;
  }

  const {
    data,
    error,
    isLoading,
    isError,
    isFetching,
    isSuccess,
    isUninitialized,
  } = orcidlinkAPI.useOrcidlinkOwnerLinkQuery({ username });

  if (isUninitialized) {
    return renderLoading('Uninitialized...', 'Loading your ORCID Link...');
  } else if (isLoading) {
    return renderLoading('Loading...', 'Loading your ORCID Link ...');
  } else if (isFetching) {
    return renderLoading('Fetching...', 'Loading your ORCID Link...');
  } else if (isError) {
    return renderError(error);
  } else if (isSuccess) {
    return renderLink(data);
  } else {
    return renderError({
      status: 'CUSTOM_ERROR',
      error: 'Unknown State',
    });
  }
}
