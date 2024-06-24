/**
 * The CountdownClock component implements a simple display of the amount of
 * time between now and some time in the future.
 *
 * At the heart is the display of a time range in clock and calendar units of
 * weeks, days, hours, minutes and seconds. Any zero values are trimmed from the
 * ends, leaving a concise expression of the time in seconds remaining.
 *
 * There could of course be options for controlling behavior, such as whether to
 * trim 0 values from the end, or whether to display leading 0s, if so desired
 * in the future.
 *
 * The component itself runs an interval timer which is used to update the time
 * span display.
 */

import { useEffect, useState } from 'react';

const CLOCK_INTERVAL = 100;
const MIN_SECS = 60;
const HOUR_SECS = 60 * MIN_SECS;
const DAY_SECS = 24 * HOUR_SECS;
const WEEK_SECS = 7 * DAY_SECS;

export interface SpanUnit {
  unit: string;
  seconds: number;
}

const spanUnits = [
  {
    unit: 'week',
    seconds: WEEK_SECS,
  },
  {
    unit: 'day',
    seconds: DAY_SECS,
  },
  {
    unit: 'hour',
    seconds: HOUR_SECS,
  },
  {
    unit: 'minute',
    seconds: MIN_SECS,
  },
  {
    unit: 'second',
    seconds: 1,
  },
];

export function formatTimeSpan(span: number) {
  let spanSeconds = Math.round(span / 1000);
  const measures = [];

  function measureUnit(span: number, unit: SpanUnit) {
    const measure = Math.floor(span / unit.seconds);
    const remaining = span - measure * unit.seconds;
    return [measure, remaining];
  }

  for (const unit of spanUnits) {
    const [measure, remaining] = measureUnit(spanSeconds, unit);
    spanSeconds = remaining;
    measures.push([measure, unit.unit]);
  }

  // trim leading 0s.
  const trimmed = [];
  let trimming = true;
  for (const [measure, unit] of measures) {
    if (trimming) {
      if (measure === 0) {
        continue;
      } else {
        trimming = false;
      }
    }
    trimmed.push([measure, unit]);
  }

  // trim trailing 0s too
  const reverseTrimmed = [];
  trimming = true;
  for (const [measure, unit] of trimmed.reverse()) {
    if (trimming) {
      if (measure === 0) {
        continue;
      } else {
        trimming = false;
      }
    }
    reverseTrimmed.push([measure, unit]);
  }

  return [
    reverseTrimmed
      .reverse()
      .map(([measure, unit]) => {
        if (measure !== 1) {
          unit += 's';
        }
        return [measure, unit].join(' ');
      })
      .join(', '),
  ].join('');
}

export interface CountdownClockProps {
  startAt: number;
  endAt: number;
  onExpired: () => void;
}

interface CountDownClockState {
  now: number;
  expired: boolean;
}

const CountdownClock = ({ endAt, onExpired }: CountdownClockProps) => {
  const [state, setState] = useState<CountDownClockState>({
    now: Date.now(),
    expired: false,
  });

  const [timer, setTimer] = useState<number | null>(null);

  /**
   * This effect should run only on mount - none of its dependencies change.
   */
  useEffect(() => {
    const timer = window.setInterval(() => {
      const now = Date.now();
      if (now >= endAt) {
        setState({
          now,
          expired: true,
        });
        if (timer) {
          window.clearInterval(timer);
        }
        onExpired();
        return;
      }
      setState({
        now,
        expired: false,
      });
    }, CLOCK_INTERVAL);
    setTimer(timer);
  }, [endAt, onExpired, setState, setTimer]);

  /**
   * This effect is used only to clean up the interval timer. The cleanup
   * function will only be invoked upon component dismount if the timer is still running.
   */
  useEffect(() => {
    return () => {
      if (timer) {
        window.clearInterval(timer);
      }
    };
  }, [timer]);

  const { now, expired } = state;
  let className = '';
  if (expired) {
    className += 'text-danger';
  }
  return <span className={className}>{formatTimeSpan(endAt - now)}</span>;
};

export default CountdownClock;
