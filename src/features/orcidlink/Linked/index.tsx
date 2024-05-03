import { Alert, AlertTitle, CircularProgress } from '@mui/material';
import { SerializedError } from '@reduxjs/toolkit';
import { orcidlinkAPI } from '../../../common/api/orcidlinkAPI';
import { KBaseBaseQueryError } from '../../../common/api/utils/common';
import { useAppSelector } from '../../../common/hooks';
import { authUsername } from '../../auth/authSlice';
import ErrorMessage from '../ErrorMessage';
import styles from '../orcidlink.module.scss';
import Linked from './Linked';

export default function LinkedController() {
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

  const { data, error, isLoading, isError, isFetching, isSuccess } =
    orcidlinkAPI.useOrcidlinkOwnerLinkQuery({ username });

  if (isLoading) {
    return renderLoading('Loading...', 'Loading your ORCID Link ...');
  } else if (isFetching) {
    return renderLoading('Fetching...', 'Loading your ORCID Link...');
  } else if (isError) {
    return renderError(error);
  } else if (isSuccess) {
    return <Linked linkRecord={data} />;
  }

  // Because TS cannot have any way of knowing that the state filtering above
  // catches all cases.
  // TODO: how can we test this case without mocking a broken RTK query api?
  return null;
}
