import {
  faExclamationCircle,
  faSpinner,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Box, Chip, Stack } from '@mui/material';

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
  size?: [width: string, height: string];
  error?: string;
}) => {
  const isLoading = props.loading ?? true;
  if (props.size && (isLoading || props.error)) {
    const {
      size: [width, height],
      ...forwardProps
    } = props;
    return (
      <Box data-testid="loader" sx={{ width, height, position: 'relative' }}>
        <Stack
          direction="row"
          justifyContent="center"
          alignItems="center"
          sx={{ width: 1, height: '100%' }}
        >
          <Loader {...forwardProps} />
        </Stack>
      </Box>
    );
  }
  if (isLoading) {
    if (props.render !== undefined) return <>{props.render}</>;
    switch (props.type) {
      case 'text':
        return <span data-testid="loader">Loading...</span>;
      case 'spinner':
      default:
        return <FontAwesomeIcon data-testid="loader" icon={faSpinner} spin />;
    }
  }
  if (props.error) {
    return (
      <Chip
        data-testid="loader"
        icon={<FontAwesomeIcon icon={faExclamationCircle} />}
        variant="outlined"
        color="error"
        label={props.error}
      />
    );
  } else {
    return <>{props.children}</>;
  }
};
