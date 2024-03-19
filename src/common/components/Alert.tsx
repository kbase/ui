import { PropsWithChildren } from 'react';
import classes from './Alert.module.scss';

export type Variant = 'info' | 'error';

export type InfoAlertProps = PropsWithChildren<{
  variant: Variant;
  title?: string;
  message?: string;
}>;

export default function InfoAlert({
  variant,
  title,
  message,
  children,
}: InfoAlertProps) {
  function renderMessage() {
    // The message takes precedence
    return message || children;
  }

  function renderTitleArea() {
    if (title) {
      return (
        <div
          className={classes[`title-${variant}`]}
          role="heading"
          aria-level={2}
        >
          {title}
        </div>
      );
    }
  }

  return (
    <div role="alert" className={classes[`main-${variant}`]}>
      {renderTitleArea()}
      <div className={classes.body}>{renderMessage()}</div>
    </div>
  );
}
