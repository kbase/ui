import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

/**
 * Component for rendering loading states
 */
export const Loader = (props: {
  /**state of loader, defaults to true */
  loading?: boolean;
  /**style of loader to render when loading==true */
  type?: 'text' | 'spinner';
  /**Loader children are rendered when loading==false */
  children?: React.ReactNode | React.ReactNode[];
  /** Overrides the loader style to render a custom loader*/
  render?: React.ReactNode | React.ReactNode[];
}) => {
  if (props.loading ?? true) {
    if (props.render !== undefined) return <>{props.render}</>;
    switch (props.type) {
      case 'text':
        return <>Loading...</>;
      case 'spinner':
      default:
        return <FontAwesomeIcon icon={faSpinner} spin />;
    }
  } else {
    return <>{props.children}</>;
  }
};
