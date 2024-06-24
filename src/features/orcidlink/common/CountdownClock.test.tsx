import { render, waitFor } from '@testing-library/react';
import CountdownClock, { formatTimeSpan } from './CountdownClock';

describe('The CountdownClock component', () => {
  it('renders correctly', async () => {
    const START = Date.now();
    const END = START + 3000;
    let ended = false;
    const ON_END = () => {
      ended = true;
    };

    const { container } = render(
      <CountdownClock startAt={START} endAt={END} onExpired={ON_END} />
    );

    await waitFor(
      () => {
        expect(container).toHaveTextContent('3 seconds');
      },
      { timeout: 2000 }
    );
    await waitFor(
      () => {
        expect(container).toHaveTextContent('2 seconds');
      },
      { timeout: 2000 }
    );
    await waitFor(
      () => {
        expect(container).toHaveTextContent('1 second');
      },
      { timeout: 2000 }
    );

    await waitFor(
      () => {
        expect(ended).toBe(true);
      },
      { timeout: 2000 }
    );
  });
});

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;

describe('The formatTimeSpan function', () => {
  it('generates a bunch of time ranges correctly', async () => {
    const cases = [
      {
        params: {
          span: 0,
        },
        expected: '',
      },
      {
        params: {
          span: 1 * SECOND,
        },
        expected: '1 second',
      },
      {
        params: {
          span: 2 * SECOND,
        },
        expected: '2 seconds',
      },
      {
        params: {
          span: MINUTE,
        },
        expected: '1 minute',
      },
      {
        params: {
          span: MINUTE + 30 * SECOND,
        },
        expected: '1 minute, 30 seconds',
      },
      {
        params: {
          // if it rounds to a minute, it will be a minute.
          span: MINUTE - 200,
        },
        expected: '1 minute',
      },
      {
        params: {
          // if not, seconds.
          span: MINUTE - 800,
        },
        expected: '59 seconds',
      },
      {
        params: {
          span: MINUTE + 30 * SECOND,
        },
        expected: '1 minute, 30 seconds',
      },
      {
        params: {
          span: 10 * MINUTE,
        },
        expected: '10 minutes',
      },
      {
        params: {
          span: HOUR - SECOND,
        },
        expected: '59 minutes, 59 seconds',
      },
      {
        params: {
          span: HOUR,
        },
        expected: '1 hour',
      },
      {
        params: {
          span: HOUR - 0.5 * SECOND,
        },
        expected: '1 hour',
      },
      {
        params: {
          span: HOUR - MINUTE + 10 * SECOND,
        },
        expected: '59 minutes, 10 seconds',
      },
      {
        params: {
          span: 2 * HOUR + 20 * MINUTE,
        },
        expected: '2 hours, 20 minutes',
      },
      {
        params: {
          span: 3 * HOUR,
        },
        expected: '3 hours',
      },
      {
        params: {
          span: DAY,
        },
        expected: '1 day',
      },

      {
        params: {
          span: DAY - HOUR + 59 * MINUTE + 59 * SECOND + 0.5 * SECOND,
        },
        expected: '1 day',
      },

      {
        params: {
          span: DAY - HOUR + 10 * MINUTE,
        },
        expected: '23 hours, 10 minutes',
      },
      {
        params: {
          span: 4 * DAY,
        },
        expected: '4 days',
      },
      {
        params: {
          span: 1 * WEEK,
        },
        expected: '1 week',
      },
      {
        params: {
          span: 13 * DAY,
        },
        expected: '1 week, 6 days',
      },
    ];

    for (const { params, expected } of cases) {
      const result = formatTimeSpan(params.span);
      expect(result).toBe(expected);
    }
  });
});
