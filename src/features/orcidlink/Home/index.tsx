import { Alert, AlertTitle, CircularProgress } from '@mui/material';
import { SerializedError } from '@reduxjs/toolkit';
import { orcidlinkAPI } from '../../../common/api/orcidlinkAPI';
import { KBaseBaseQueryError } from '../../../common/api/utils/common';
import { useAppSelector } from '../../../common/hooks';
import { authUsername } from '../../auth/authSlice';
import { usePageTitle } from '../../layout/layoutSlice';
import ErrorMessage from '../ErrorMessage';
import styles from '../orcidlink.module.scss';
import Home from './Home';

export default function HomeController() {
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
    data: isLinked,
    error,
    isLoading,
    isError,
    isFetching,
    isSuccess,
  } = orcidlinkAPI.useOrcidlinkIsLinkedQuery({ username });

  if (isLoading) {
    return renderLoading('Loading...', 'Loading the ORCID Link App...');
  } else if (isFetching) {
    return renderLoading('Fetching...', 'Loading the ORCID Link App...');
  } else if (isError) {
    return renderError(error);
  } else if (isSuccess) {
    return <Home isLinked={isLinked} />;
  }

  // Because TS cannot have any way of knowing that the state filtering above
  // catches all cases.
  // TODO: how can we test this case without mocking a broken RTK query api?
  return null;
}
