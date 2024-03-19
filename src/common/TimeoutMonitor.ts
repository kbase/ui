export type IntervalCallback = (elapsed: number) => Promise<void>;
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
  interval: number;
  timeout: number;
}

export default class TimeoutMonitor {
  onInterval?: IntervalCallback;
  onTimeout: TimeoutCallback;
  timeout: number;
  interval: number;
  state: TimeoutMonitorState;

  constructor({ onInterval, onTimeout, interval, timeout }: MonitorParams) {
    this.onInterval = onInterval;
    this.onTimeout = onTimeout;

    this.interval = interval;
    this.timeout = timeout;

    this.state = {
      status: TimeoutMonitorStatus.NONE,
    };
  }

  async start() {
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
  private async monitoringLoop() {
    // Run initial interval callback.
    try {
      this.onInterval && (await this.onInterval(0));
    } catch (ex) {
      const message = ex instanceof Error ? ex.message : 'Unknown error';
      // eslint-disable-next-line no-console
      console.error('Error running interval callback', message, ex);
    }

    const loop = () => {
      return window.setTimeout(async () => {
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
        }
        try {
          this.onInterval && (await this.onInterval(this.state.elapsed));
        } catch (ex) {
          const message = ex instanceof Error ? ex.message : 'Unknown error';
          // eslint-disable-next-line no-console
          console.error('Error running interval callback', message, ex);
        }
        this.state.timer = loop();
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
