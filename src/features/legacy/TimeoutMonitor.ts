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
 * Internally utilizes an series of interval timers, calling the interval callback at
 * the expiration of each interval, and ultimately calling the timeout
 */

export const DEFAULT_INTERVAL = 100;

export type IntervalCallback = (elapsed: number) => void;
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
  timer: number;
}

export interface TimeoutMonitorStateTimedout extends TimeoutMonitorStateBase {
  status: TimeoutMonitorStatus.TIMEDOUT;
  started: number;
  elapsed: number;
  timer: number;
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
  onInterval?: IntervalCallback;
  onTimeout: TimeoutCallback;
  timeout: number;
  interval?: number;
  state: TimeoutMonitorState;

  constructor({ onInterval, onTimeout, interval, timeout }: MonitorParams) {
    this.onInterval = onInterval;
    this.onTimeout = onTimeout;

    this.interval =
      typeof interval === 'undefined' ? DEFAULT_INTERVAL : interval;
    this.timeout = timeout;

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

    return this.monitoringLoop();
  }

  /**
   * This method wraps the internal "setTimeout" loop. We use setTimeout rather
   * than setInterval, because onInterval will consume some time, and we never
   * want the onInterval calls to overlap.
   */
  private monitoringLoop() {
    // Run initial interval callback.
    try {
      this.onInterval && this.onInterval(0);
    } catch (ex) {
      const message = ex instanceof Error ? ex.message : 'Unknown error';
      // eslint-disable-next-line no-console
      console.error('Error running interval callback', message, ex);
    }

    const loop = () => {
      return window.setTimeout(() => {
        if (this.state.status !== TimeoutMonitorStatus.RUNNING) {
          return null;
        }
        const now = Date.now();
        this.state.elapsed = now - this.state.started;
        if (this.state.elapsed > this.timeout) {
          window.clearTimeout(this.state.timer);
          try {
            this.onTimeout(this.state.elapsed);
          } catch (ex) {
            const message = ex instanceof Error ? ex.message : 'Unknown error';
            // eslint-disable-next-line no-console
            console.error('Error running timeout callback', message, ex);
          }
          this.state = {
            ...this.state,
            status: TimeoutMonitorStatus.TIMEDOUT,
          };
        } else {
          try {
            this.onInterval && this.onInterval(this.state.elapsed);
          } catch (ex) {
            const message = ex instanceof Error ? ex.message : 'Unknown error';
            // eslint-disable-next-line no-console
            console.error('Error running interval callback', message, ex);
          }
          this.state.timer = loop();
        }
      }, this.interval);
    };

    const timer = loop();
    this.state = {
      status: TimeoutMonitorStatus.RUNNING,
      started: Date.now(),
      elapsed: 0,
      timer,
    };
  }

  /**
   * Stops the any running timers, and sets the internal state to STOPPED.
   */
  stop() {
    if (this.state.status === TimeoutMonitorStatus.RUNNING) {
      window.clearTimeout(this.state.timer);
      this.state = {
        ...this.state,
        status: TimeoutMonitorStatus.STOPPED,
      };
    }
  }
}
