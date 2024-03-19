import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { PropsWithChildren } from 'react';
import classes from './LoadingOverlay.module.scss';

export type LoadingOverlayProps = PropsWithChildren<{
  message?: string;
}>;

const LoadingOverlay = ({ message, children }: LoadingOverlayProps) => {
  function renderLoading() {
    if (!message && children) {
      return children;
    }
    return (
      <div className={classes.loading}>
        <FontAwesomeIcon icon={faSpinner} spin />
        <div className={classes.message}>{message}</div>
      </div>
    );
  }

  return <div className={classes.main}>{renderLoading()}</div>;
};

export default LoadingOverlay;
