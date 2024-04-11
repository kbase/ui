import { waitFor } from '@testing-library/react';
import { WAIT_FOR_TIMEOUT } from '../../common/testUtils';
import TimeoutMonitor, {
  TimeoutMonitorStateRunning,
  TimeoutMonitorStatus,
} from './TimeoutMonitor';

describe('TimeoutMonitor class', () => {
  let errorLogSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.resetAllMocks();
    errorLogSpy = jest.spyOn(console, 'error');
  });

  test('operates normally with minimal inputs', async () => {
    let timedOutAfter: number | null = null;
    const onTimeout = (elapsed: number) => {
      timedOutAfter = elapsed;
    };

    const timeout = 200;
    const interval = 50;

    const monitor = new TimeoutMonitor({ onTimeout, timeout, interval });

    monitor.start();

    await waitFor(
      () => {
        expect(timedOutAfter).toBeGreaterThanOrEqual(timeout);
      },
      { timeout: WAIT_FOR_TIMEOUT }
    );
  });

  test('correctly calls interval callback', async () => {
    let timedOutAfter: number | null = null;
    const onTimeout = (elapsed: number) => {
      timedOutAfter = elapsed;
    };

    // Track all the calls to onInterval so we can inspect after the timeout elapses.
    const intervals: Array<number> = [];
    const onInterval = ({ elapsed }: TimeoutMonitorStateRunning) => {
      intervals.push(elapsed);
    };

    const timeout = 250;
    const interval = 50;

    const monitor = new TimeoutMonitor({
      onTimeout,
      onInterval,
      timeout,
      interval,
    });

    monitor.start();

    await waitFor(
      () => {
        expect(timedOutAfter).toBeGreaterThan(timeout);
        // There are really no guarantees about how many iterations are run, due to the
        // passage of time between each loop.
        expect(intervals.length).toBeGreaterThan(4);
        expect(intervals.length).toBeLessThan(7);
      },
      { timeout: WAIT_FOR_TIMEOUT }
    );
  });

  test('correctly calls interval callback with default interval', async () => {
    let timedOutAfter: number | null = null;
    const onTimeout = (elapsed: number) => {
      timedOutAfter = elapsed;
    };

    // Track all the calls to onInterval so we can inspect after the timeout elapses.
    const intervals: Array<number> = [];
    const onInterval = ({ elapsed }: TimeoutMonitorStateRunning) => {
      intervals.push(elapsed);
    };

    const timeout = 250;
    const interval = 50;

    const monitor = new TimeoutMonitor({
      onTimeout,
      onInterval,
      timeout,
      interval,
    });

    monitor.start();

    await waitFor(
      () => {
        expect(timedOutAfter).toBeGreaterThan(timeout);
        // There are really no guarantees about how many iterations are run
        // other than the first one, due to the passage of time between each
        // loop and the inaccuracy of JS timers.
        //
        // There is an initial call run before the timer loop, then then one
        // call every "interval".
        //
        // The interval, however, is not guaranteed. I've seen a 50ms timeout
        // take over 200ms.
        //
        // So in the test data above, we might think that would be 1 + 5 or 6
        // intervals.
        //
        // However, we can only be sure that at least one ocurred.
        expect(intervals.length).toBeGreaterThanOrEqual(1);
      },
      { timeout: WAIT_FOR_TIMEOUT }
    );
  });

  test('stopping the monitor immediately ceases all interval callbacks and the ultimate timeout callback', async () => {
    let timedOutAfter: number | null = null;
    const onTimeout = (elapsed: number) => {
      timedOutAfter = elapsed;
    };

    const intervals: Array<number> = [];
    const onInterval = ({ elapsed }: TimeoutMonitorStateRunning) => {
      intervals.push(elapsed);
    };

    const timeout = 250;
    const interval = 50;

    const monitor = new TimeoutMonitor({
      onTimeout,
      onInterval,
      timeout,
      interval,
    });

    // If we start and then stop immediately, only one onInterval should be called. When
    // the monitor starts, it runs an initial onInterval, and enters the timeout-driven loop.
    monitor.start();
    monitor.stop();

    await expect(
      waitFor(
        () => {
          // Should never be non-null.
          expect(timedOutAfter).not.toBeNull();
          // Should only get 1 interval recorded.
          expect(intervals.length).toBe(1);
        },
        { timeout: WAIT_FOR_TIMEOUT }
      )
    ).rejects.toThrow();
  });

  test('stopping the monitor after a brief period ceases all future interval callbacks and the ultimate timeout callback', async () => {
    let timedOutAfter: number | null = null;
    const onTimeout = (elapsed: number) => {
      timedOutAfter = elapsed;
    };

    const intervals: Array<number> = [];
    const onInterval = ({ elapsed }: TimeoutMonitorStateRunning) => {
      intervals.push(elapsed);
    };

    const timeout = 250;
    const interval = 50;
    const pause = 75;

    const monitor = new TimeoutMonitor({
      onTimeout,
      onInterval,
      timeout,
      interval,
    });

    // If we start and then stop immediately, only one onInterval should be called. When
    // the monitor starts, it runs an initial onInterval, and enters the timeout-driven loop.
    monitor.start();

    // This pause should give us enough time for one turn of the loop, and probably no more.
    // DOM timers are not precise, though, so we can't count on the total number of iterations.
    await new Promise((resolve) => {
      window.setTimeout(() => {
        resolve(null);
      }, pause);
    });

    monitor.stop();

    await expect(
      waitFor(
        () => {
          // Should never be non-null.
          expect(timedOutAfter).not.toBeNull();
          // Should only get 1 interval recorded.
          expect(intervals.length).toBeGreaterThan(1);
        },
        { timeout: WAIT_FOR_TIMEOUT }
      )
    ).rejects.toThrow();
  });

  test('stopping an unstarted monitor does nothing', async () => {
    let timedOutAfter: number | null = null;
    const onTimeout = (elapsed: number) => {
      timedOutAfter = elapsed;
    };

    const intervals: Array<number> = [];
    const onInterval = ({ elapsed }: TimeoutMonitorStateRunning) => {
      intervals.push(elapsed);
    };

    const timeout = 250;
    const interval = 50;

    const monitor = new TimeoutMonitor({
      onTimeout,
      onInterval,
      timeout,
      interval,
    });

    // If we want to ensure that the monitor is started before we stop it, we need to
    // wait until it starts! The async aspect of starting is that the initial
    // `onInterval` is called.
    monitor.stop();

    await expect(
      waitFor(
        () => {
          // Should never be non-null.
          expect(timedOutAfter).not.toBeNull();
          // Should only get no intervals recorded
          expect(intervals.length).toBeGreaterThan(0);
        },
        { timeout: WAIT_FOR_TIMEOUT }
      )
    ).rejects.toThrow();
  });

  test('starting twice has no effect', async () => {
    const onTimeout = (elapsed: number) => {
      // noop
    };

    const timeout = 200;
    const interval = 50;

    const monitor = new TimeoutMonitor({ onTimeout, timeout, interval });

    await monitor.start();

    const monitorState = monitor.state;

    expect(monitorState.status).toEqual(TimeoutMonitorStatus.RUNNING);

    let startedAt;
    if (monitorState.status === TimeoutMonitorStatus.RUNNING) {
      startedAt = monitorState.started;
    }

    monitor.start();

    let startedAt2;
    if (monitorState.status === TimeoutMonitorStatus.RUNNING) {
      startedAt2 = monitorState.started;
    }

    expect(startedAt).toEqual(startedAt2);
  });

  test('an error in the timeout callback should be logged', async () => {
    const errorMessage = 'Blame the tests';

    const timeout = 100;
    const interval = 50;

    const testCases = [
      {
        onTimeout: (_: number) => {
          throw new Error(errorMessage);
        },
        expected: {
          errorMessage,
          errorType: Error,
        },
      },
      {
        onTimeout: (_: number) => {
          throw errorMessage;
        },
        expected: {
          errorMessage: 'Unknown error',
          errorType: String,
        },
      },
    ];

    for (const {
      onTimeout,
      expected: { errorMessage, errorType },
    } of testCases) {
      const monitor = new TimeoutMonitor({ onTimeout, timeout, interval });

      monitor.start();

      await waitFor(
        // eslint-disable-next-line no-loop-func
        () => {
          expect(errorLogSpy).toHaveBeenCalledWith(
            'Error running timeout callback',
            errorMessage,
            expect.any(errorType)
          );
        },
        { timeout: WAIT_FOR_TIMEOUT }
      );
    }
  });

  test('an error in the interval callback should be logged', async () => {
    const errorMessage = 'Blame the tests';

    const testCases = [
      {
        onInterval: (_state: TimeoutMonitorStateRunning) => {
          throw new Error(errorMessage);
        },
        expected: {
          errorMessage,
          errorType: Error,
        },
      },
      {
        onInterval: (_state: TimeoutMonitorStateRunning) => {
          throw errorMessage;
        },
        expected: {
          errorMessage: 'Unknown error',
          errorType: String,
        },
      },
    ];

    const onTimeout = (_: number) => {
      // do nothing
    };

    const timeout = 200;
    const interval = 50;

    for (const {
      onInterval,
      expected: { errorMessage, errorType },
    } of testCases) {
      jest.resetAllMocks();
      const monitor = new TimeoutMonitor({
        onTimeout,
        onInterval,
        timeout,
        interval,
      });

      monitor.start();

      await waitFor(
        // eslint-disable-next-line no-loop-func
        () => {
          expect(errorLogSpy).toHaveBeenCalled();
          expect(errorLogSpy).toHaveBeenNthCalledWith(
            1,
            'Error running interval callback',
            errorMessage,
            expect.any(errorType)
          );
          expect(errorLogSpy).toHaveBeenNthCalledWith(
            2,
            'Error running interval callback',
            errorMessage,
            expect.any(errorType)
          );
          expect(errorLogSpy).toHaveBeenNthCalledWith(
            3,
            'Error running interval callback',
            errorMessage,
            expect.any(errorType)
          );
        },
        { timeout: WAIT_FOR_TIMEOUT }
      );

      monitor.stop();
    }
  });
});
