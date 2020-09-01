import { WorkerMessage } from "./worker";

interface PromiseData {
  resolve: Function;
  reject: Function,
  messageId: number;
}

export default class AsyncWorker {
  private worker: Worker;
  private currentId: number = 0;
  private pendingMessages: PromiseData[] = [];
  constructor(workerPath: string, workerOptions?: WorkerOptions) {
    this.worker = new Worker(workerPath, workerOptions);
    this.worker.onmessage = (message: any) => this.handleMessage(message);
  }

  public postMessage<T>(data: WorkerMessage): Promise<T> {
    const messageId = this.nextId();
    return new Promise((resolve, reject) => {
      this.savePromise(resolve, reject, messageId);
      this.worker.postMessage({ ...data, messageId });
    });
  }

  private nextId() {
    this.currentId++;
    return this.currentId;
  }

  private savePromise(resolve: Function, reject: Function, messageId: number) {
    this.pendingMessages.push({resolve, reject, messageId: messageId});
  }

  private handleMessage(message: { data: { body: any, messageId: number }}) {
    const savedMessage = this.pendingMessages.find((promiseData) => promiseData.messageId === message.data.messageId);
    if (!savedMessage) {
      return;
    }
    savedMessage.resolve(message.data.body);
    this.removeMessage(savedMessage);
  }

  private removeMessage(message: PromiseData): void {
    const index = this.pendingMessages.indexOf(message);
    if (index === -1) {
      return;
    }
    this.pendingMessages.splice(index, 1);
  }
}