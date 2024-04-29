import Alert from '@mui/material/Alert';
import { SerializedError } from '@reduxjs/toolkit';
import { KBaseBaseQueryError } from '../../common/api/utils/common';
import styles from './orcidlink.module.scss';

export interface ErrorMessageProps {
  error: KBaseBaseQueryError | SerializedError;
}

export default function ErrorMessage({ error }: ErrorMessageProps) {
  const message = (() => {
    if ('status' in error) {
      switch (error.status) {
        case 'JSONRPC_ERROR':
          return error.data.error.message;
        case 'FETCH_ERROR':
          return 'Fetch Error';
        case 'CUSTOM_ERROR':
          return error.error;
        case 'PARSING_ERROR':
          return error.error;
        case 'TIMEOUT_ERROR':
          return error.error;
      }
    } else {
      return error.message || 'Unknown Error';
    }
  })();
  return (
    <div className={styles['error-message']}>
      <Alert severity="error" title="Error">
        {message}
      </Alert>
    </div>
  );
}
