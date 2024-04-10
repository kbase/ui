const DEFAULT_INTERVAL = 100;

export interface PeriodicTaskParams {
  interval?: number;
  task: (stop: () => void) => Promise<void>;
}

export default class PeriodicTask {
  params: PeriodicTaskParams;
  timeoutId: number | null = null;
  status: 'running' | 'stopped' | null = null;
  constructor(params: PeriodicTaskParams) {
    this.params = params;
  }

  runTask() {
    this.timeoutId = window.setTimeout(async () => {
      if (this.status === 'stopped') {
        return;
      }
      await this.params.task(this.stop.bind(this));
      this.runTask();
    }, DEFAULT_INTERVAL);
  }

  start() {
    this.runTask();
    return this;
  }

  stop() {
    if (this.timeoutId) {
      this.status = 'stopped';
      window.clearTimeout(this.timeoutId);
    }
    return this;
  }
}
