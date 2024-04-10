/**
 * A component to display the time left until a given duration has been met.
 *
 * In other words, a count-down to a given time limit. It is bespoke for the
 * legacy component. It displays both the time remaining, the total time limit,
 * and a progress bar.
 */
import { Box, Typography } from '@mui/material';
import LinearProgress from '@mui/material/LinearProgress';
import { useEffect, useState } from 'react';

export interface CountdownClockProps {
  duration: number;
  elapsed?: number;
}

const CountdownClock = (props: CountdownClockProps) => {
  const [currentTime, setCurrentTime] = useState<number>(Date.now());

  const [startTime] = useState<number>(Date.now());

  // Just keeps the clock ticking.
  useEffect(() => {
    window.setInterval(() => {
      setCurrentTime(Date.now());
    }, 100);
  }, [setCurrentTime]);

  const totalDurationInSeconds = props.duration / 1000;

  const elapsedInSeconds =
    Math.round((currentTime - startTime) / 1000) + (props.elapsed || 0) / 1000;

  return (
    <Box>
      <LinearProgress
        variant="determinate"
        value={(100 * elapsedInSeconds) / totalDurationInSeconds}
      />
      <Typography style={{ textAlign: 'center' }}>
        {elapsedInSeconds} of {totalDurationInSeconds} seconds
      </Typography>
    </Box>
  );
};

export default CountdownClock;
