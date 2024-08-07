/**
 * Displays an error message as may be retured by an RTK query.
 *
 * Currently very basic, just displaying the message in an Alert. However, some
 * errors would benefit from a more specialized display.
 */
import Alert from '@mui/material/Alert';
import { SerializedError } from '@reduxjs/toolkit';
import { KBaseBaseQueryError } from '../../../common/api/utils/common';
import styles from './ErrorMessage.module.scss';

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
          return error.error;
        case 'CUSTOM_ERROR':
          return error.error;
        case 'PARSING_ERROR':
          return error.error;
        case 'TIMEOUT_ERROR':
          return error.error;
      }
      if ('status' in error && typeof error.status === 'number') {
        return `HTTP Status Code: ${error.status}`;
      }
    } else {
      return error.message || 'Unknown Error';
    }
  })();
  return (
    <div className={styles.main}>
      <Alert severity="error" title="Error">
        {message}
      </Alert>
    </div>
  );
}
