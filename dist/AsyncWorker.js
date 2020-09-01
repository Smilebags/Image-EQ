export default class AsyncWorker {
    constructor(workerPath, workerOptions) {
        this.currentId = 0;
        this.pendingMessages = [];
        this.worker = new Worker(workerPath, workerOptions);
        this.worker.onmessage = (message) => this.handleMessage(message);
    }
    postMessage(data) {
        const messageId = this.nextId();
        return new Promise((resolve, reject) => {
            this.savePromise(resolve, reject, messageId);
            this.worker.postMessage({ ...data, messageId });
        });
    }
    nextId() {
        this.currentId++;
        return this.currentId;
    }
    savePromise(resolve, reject, messageId) {
        this.pendingMessages.push({ resolve, reject, messageId: messageId });
    }
    handleMessage(message) {
        const savedMessage = this.pendingMessages.find((promiseData) => promiseData.messageId === message.data.messageId);
        if (!savedMessage) {
            return;
        }
        savedMessage.resolve(message.data.body);
        this.removeMessage(savedMessage);
    }
    removeMessage(message) {
        const index = this.pendingMessages.indexOf(message);
        if (index === -1) {
            return;
        }
        this.pendingMessages.splice(index, 1);
    }
}
