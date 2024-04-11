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
  interval: number;
  elapsed?: number;
}

const CountdownClock = (props: CountdownClockProps) => {
  const [currentTime, setCurrentTime] = useState<number>(Date.now());

  const [startTime] = useState<number>(Date.now());

  // Just keeps the clock ticking.
  useEffect(() => {
    const timer = window.setInterval(() => {
      const now = Date.now();
      const elapsed = now - startTime;
      if (elapsed > props.duration) {
        window.clearInterval(timer);
      }
      setCurrentTime(now);
    }, props.interval);

    return () => {
      window.clearInterval(timer);
    };
  }, [startTime, props.interval, props.duration, setCurrentTime]);

  const totalDurationInSeconds = props.duration / 1000;

  const elapsedInSeconds =
    Math.round((currentTime - startTime) / 1000) + (props.elapsed || 0) / 1000;

  const elapsed = currentTime - startTime;
  const isDone = elapsed >= props.duration;

  const message = (() => {
    if (isDone) {
      return `DONE - ${totalDurationInSeconds} seconds have elapsed`;
    }
    return `${elapsedInSeconds} of ${totalDurationInSeconds} seconds remaining`;
  })();

  return (
    <Box>
      <LinearProgress
        variant="determinate"
        value={(100 * elapsedInSeconds) / totalDurationInSeconds}
      />
      <Typography style={{ textAlign: 'center' }}>{message}</Typography>
    </Box>
  );
};

export default CountdownClock;
