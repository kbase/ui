/**
 * Displays an error message as may be returned by an RTK query.
 *
 * Currently very basic, just displaying the message in an Alert. However, some
 * errors would benefit from a more specialized display.
 */
import { AlertTitle } from '@mui/material';
import Alert from '@mui/material/Alert';
import { SerializedError } from '@reduxjs/toolkit';
import { KBaseBaseQueryError } from '../../../common/api/utils/common';
import styles from './ErrorMessage.module.scss';

export interface SolutionLink {
  label?: string;
  url?: string;
}

export interface Solution {
  description: string;
  link?: SolutionLink;
}

export interface CommonError {
  type: 'COMMON_ERROR';
  message: string;
  details?: string;
  title?: string;
  solutions?: Array<Solution>;
}

export function makeCommonError(error: Omit<CommonError, 'type'>): CommonError {
  return {
    type: 'COMMON_ERROR',
    ...error,
  };
}

export interface ErrorMessageProps {
  error: KBaseBaseQueryError | SerializedError | CommonError;
}

export default function ErrorMessage({ error }: ErrorMessageProps) {
  function renderKBaseQueryError(error: KBaseBaseQueryError) {
    const message = (() => {
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
    })();

    return (
      <div className={styles.main}>
        <Alert severity="error" title="Error">
          {message}
        </Alert>
      </div>
    );
  }

  function renderReduxSerializedError(error: SerializedError) {
    // Bare minimal for redux error
    return (
      <div className={styles.main}>
        <Alert severity="error" title="Error">
          {error.message || 'Unknown error'}
        </Alert>
      </div>
    );
  }

  function renderCommonError({
    message,
    details,
    title,
    solutions,
  }: CommonError) {
    function renderDetails() {
      if (!details) {
        return;
      }
      return <p>{details}</p>;
    }

    function renderSolutions() {
      if (solutions && solutions.length > 0) {
        const solutionItems = solutions.map(({ description, link }, index) => {
          if (link) {
            return (
              <li key={index}>
                <div>{description}</div>
                <div className={styles.solution_item_link}>
                  <a href={link.url}>{link.label}</a>
                </div>
              </li>
            );
          }
          return (
            <li key={index}>
              <div>{description}</div>
            </li>
          );
        });
        return <ul className={styles.solutions_list}>{solutionItems}</ul>;
      }
    }

    if (title) {
      return (
        <div className={styles.main}>
          <Alert severity="error">
            <AlertTitle>{title}</AlertTitle>
            {message}
            {renderDetails()}
            {renderSolutions()}
          </Alert>
        </div>
      );
    }
    return (
      <div className={styles.main}>
        <Alert severity="error">
          {message}
          {renderDetails()}
          {renderSolutions()}
        </Alert>
      </div>
    );
  }

  if ('status' in error) {
    return renderKBaseQueryError(error);
  } else if ('type' in error && error.type === 'COMMON_ERROR') {
    return renderCommonError(error);
  } else {
    return renderReduxSerializedError(error);
  }
}
