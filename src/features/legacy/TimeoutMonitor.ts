/**
 * A class dedicated to the prospect of launching a timer which, when it times out, will
 * invoke a provided callback function.
 *
 * An optional interval callback allows the caller to utilize progressive notification
 * to the user.
 *
 * The basic design is to launch a timeout monitor at the beginning of some process
 * which may take a long time (in user-web time!), may fail, and needs to be protected
 * from a potentially infinite wait.
 *
 * Used for the legacy support to provide a loading screen on top of the kbase-ui
 * iframe, as it is susceptible to long load times on slow network connections. We have
 * encountered this in the wild with users in certain parts of the world; e.g. south africa.
 *
 * Also, as there is no way to report a critical error from a web app loaded in an
 * iframe (e.g. 404, 400, 502, misconfiguration resulting in a crash) the combination of
 * an iframe overlay cover with the timer ensures that any such errors are reported
 * (although the reason cannot be reported.)
 *
 * A side benefit is that it can support progressive notification, proactively alerting
 * the user if loading kbase-ui is taking a long time.
 *
 * Internal design is a "timer loop", in which a loop function is called to perform the
 * task (ensure the timeout period has not elapsed, and call the onInterval callback if
 * provided), and then start a timeout timer which will call the loop after the interval period.
 *
 * This design ensures that the supplied interval amount of time passes between each
 * iteration of the loop. Compared to an interval timer, this ensures that a long
 * running onInterval callback does not cause the intervals to overlap.
 *
 * Anyway, it prioritizes ensuring the requested interval over the precise timing of
 * intervals in the timeout period.
 */

export type IntervalCallback = (state: TimeoutMonitorStateRunning) => void;
export type TimeoutCallback = (elapsed: number) => void;

export enum TimeoutMonitorStatus {
  NONE = 'NONE',
  STARTING = 'STARTING',
  RUNNING = 'RUNNING',
  TIMEDOUT = 'TIMEDOUT',
  STOPPED = 'STOPPED',
}

export interface TimeoutMonitorStateBase {
  status: TimeoutMonitorStatus;
}

export interface TimeoutMonitorStateNone extends TimeoutMonitorStateBase {
  status: TimeoutMonitorStatus.NONE;
}

export interface TimeoutMonitorStateStarting extends TimeoutMonitorStateBase {
  status: TimeoutMonitorStatus.STARTING;
  started: number;
  elapsed: number;
}

export interface TimeoutMonitorStateRunning extends TimeoutMonitorStateBase {
  status: TimeoutMonitorStatus.RUNNING;
  started: number;
  elapsed: number;
}

export interface TimeoutMonitorStateTimedout extends TimeoutMonitorStateBase {
  status: TimeoutMonitorStatus.TIMEDOUT;
  started: number;
  elapsed: number;
}

export interface TimeoutMonitorStateStopped extends TimeoutMonitorStateBase {
  status: TimeoutMonitorStatus.STOPPED;
  started: number;
  elapsed: number;
}

export type TimeoutMonitorState =
  | TimeoutMonitorStateNone
  | TimeoutMonitorStateStarting
  | TimeoutMonitorStateRunning
  | TimeoutMonitorStateTimedout
  | TimeoutMonitorStateStopped;

interface MonitorParams {
  onInterval?: IntervalCallback;
  onTimeout: TimeoutCallback;
  interval?: number;
  timeout: number;
}

export default class TimeoutMonitor {
  state: TimeoutMonitorState;
  params: MonitorParams;

  constructor(params: MonitorParams) {
    this.params = params;
    this.state = {
      status: TimeoutMonitorStatus.NONE,
    };
  }

  /**
   * Starts the timeout loop.
   *
   * @returns
   */
  start() {
    if (this.state.status !== TimeoutMonitorStatus.NONE) {
      return;
    }

    this.state = {
      status: TimeoutMonitorStatus.STARTING,
      started: Date.now(),
      elapsed: 0,
    };

    return this.enterLoop();
  }

  runOnInterval(state: TimeoutMonitorStateRunning) {
    try {
      this.params.onInterval && this.params.onInterval(state);
    } catch (ex) {
      const message = ex instanceof Error ? ex.message : 'Unknown error';
      // eslint-disable-next-line no-console
      console.error('Error running interval callback', message, ex);
    }
  }

  /**
   * This method wraps the internal "setTimeout" loop. We use setTimeout rather
   * than setInterval, because onInterval will consume some time, and we never
   * want the onInterval calls to overlap.
   */
  private enterLoop() {
    const loop = () => {
      // May be canceled, in which case we just terminate the loop.
      if (this.state.status !== TimeoutMonitorStatus.RUNNING) {
        return;
      }
      const elapsed = Date.now() - this.state.started;

      // Handle case of timing out.
      if (this.state.elapsed > this.params.timeout) {
        try {
          this.params.onTimeout(this.state.elapsed);
        } catch (ex) {
          const message = ex instanceof Error ? ex.message : 'Unknown error';
          // eslint-disable-next-line no-console
          console.error('Error running timeout callback', message, ex);
        }
        this.state = {
          ...this.state,
          elapsed,
          status: TimeoutMonitorStatus.TIMEDOUT,
        };
        return;
      }

      // Otherwise, track progress, maybe run the onInterval callback, and loop.
      this.state = {
        ...this.state,
        elapsed,
      };

      this.runOnInterval(this.state);

      window.setTimeout(() => {
        loop();
      }, this.params.interval);
    };

    this.state = {
      status: TimeoutMonitorStatus.RUNNING,
      started: Date.now(),
      elapsed: 0,
    };

    loop();
  }

  /**
   * Sets the internal state to STOPPED, which will cause the timeout loop to do nothing
   * but exit on it's next iteration.
   */
  stop() {
    if (this.state.status === TimeoutMonitorStatus.RUNNING) {
      this.state = {
        status: TimeoutMonitorStatus.STOPPED,
        started: this.state.started,
        elapsed: this.state.elapsed,
      };
    }
  }
}
