import { FC, PropsWithChildren } from 'react';
import { Box } from '@mui/material';

interface TextClampProps extends PropsWithChildren {
  /** Max number of lines to show before clamping */
  lines?: number;
}

/**
 * Clamp inner content to a specified number of lines.
 * Shows an ellipsis at the end of the last line.
 */
const TextClamp: FC<TextClampProps> = ({ lines = 2, children }) => {
  return (
    <Box
      sx={{
        display: '-webkit-box',
        WebkitLineClamp: lines,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
      }}
    >
      {children}
    </Box>
  );
};

export default TextClamp;
