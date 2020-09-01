import AsyncWorker from "./AsyncWorker.js";
import { WorkerMessage } from "./worker.js";

interface Task {
  message: WorkerMessage;
  resolve: Function;
}

interface PoolWorker {
  status: 'free' | 'busy';
  worker: AsyncWorker;
};

export default class AsyncWorkerPool {
  private workers: PoolWorker[];
  private queue: Task[] = [];

  constructor(
    public workerCount: number,
    workerPath: string,
    workerOptions?: WorkerOptions,
  ) {
    this.workers = [];
    for (let i = 0; i < workerCount; i++) {
      const worker = new AsyncWorker(workerPath, workerOptions);
      this.workers.push({
        worker,
        status: 'free',
      });
    }
  }

  sendToEach<T>(message: WorkerMessage): Promise<T[]> {
    return Promise.all(this.workers.map(async (worker) => {
      worker.status = 'busy';
      const result = await worker.worker.postMessage<T>(message);
      worker.status = 'free';
      return result;
    }));
  }

  postMessage<T>(message: WorkerMessage): Promise<T> {
    return new Promise((resolve) => {
      this.queue.push({
        message,
        resolve,
      });
      this.doWork();
    });
  }

  postMessages<T>(messages: WorkerMessage[]): Promise<T[]> {
    return Promise.all(messages.map((message) => this.postMessage<T>(message)));
  }

  private getFreeWorker(): PoolWorker | null {
    const worker = this.workers.find(item => item.status === 'free');
    if (!worker) {
      return null;
    }
    return worker;
  }

  private async doWork(): Promise<void> {
    if (this.queue.length === 0) {
      return;
    }
    const freeWorker = this.getFreeWorker();
    if (!freeWorker) {
      return;
    }
    const task = this.queue.shift()!;
    const response = await this.doMessage(freeWorker, task.message);
    task.resolve(response);
    this.doWork();
  }

  private async doMessage<T>(worker: PoolWorker, message: WorkerMessage): Promise<T> {
    worker.status = 'busy';
    const result = await worker.worker.postMessage<T>(message);
    worker.status = 'free';
    return result;
  }
}