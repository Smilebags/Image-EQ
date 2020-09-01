import AsyncWorker from "./AsyncWorker.js";
;
export default class AsyncWorkerPool {
    constructor(workerCount, workerPath, workerOptions) {
        this.workerCount = workerCount;
        this.queue = [];
        this.workers = [];
        for (let i = 0; i < workerCount; i++) {
            const worker = new AsyncWorker(workerPath, workerOptions);
            this.workers.push({
                worker,
                status: 'free',
            });
        }
    }
    sendToEach(message) {
        return Promise.all(this.workers.map(async (worker) => {
            worker.status = 'busy';
            const result = await worker.worker.postMessage(message);
            worker.status = 'free';
            return result;
        }));
    }
    postMessage(message) {
        return new Promise((resolve) => {
            this.queue.push({
                message,
                resolve,
            });
            this.doWork();
        });
    }
    postMessages(messages) {
        return Promise.all(messages.map((message) => this.postMessage(message)));
    }
    getFreeWorker() {
        const worker = this.workers.find(item => item.status === 'free');
        if (!worker) {
            return null;
        }
        return worker;
    }
    async doWork() {
        if (this.queue.length === 0) {
            return;
        }
        const freeWorker = this.getFreeWorker();
        if (!freeWorker) {
            return;
        }
        const task = this.queue.shift();
        const response = await this.doMessage(freeWorker, task.message);
        task.resolve(response);
        this.doWork();
    }
    async doMessage(worker, message) {
        worker.status = 'busy';
        const result = await worker.worker.postMessage(message);
        worker.status = 'free';
        return result;
    }
}
