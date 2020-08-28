import { DCT, IDCT } from './dct.js';

interface WorkerMessageBase {
  operation: string;
  payload: any;
}

export interface SetSourceBufferMessage extends WorkerMessageBase {
  operation: 'setSourceBuffer';
  payload: Float32Array;
}
export interface DCTMessage extends WorkerMessageBase {
  operation: 'dct';
  payload: null;
}

export type WorkerMessage = SetSourceBufferMessage | DCTMessage;

export interface WorkerResponse {
  values: number[];
}

class CalculationWorker {
  sourceBuffer?: Float32Array;

  constructor(
    private postMessage: Function,
  ) {}


  handleMessage(message: WorkerMessage) {
    switch (message.operation) {
      case 'setSourceBuffer':
        this.setSourceBuffer(message.payload);
        break;
      case 'dct':
        this.dct();
        break;
      default:
        break;
    }
  }

  setSourceBuffer(payload: SetSourceBufferMessage['payload']) {
    this.sourceBuffer = payload;
    this.sendMessage('done');
  }

  dct() {
    if (!this.sourceBuffer) {
      return;
    }
    this.sendMessage(DCT(this.sourceBuffer  as any));
  }

  sendMessage(message: any) {
    this.postMessage(message);
  }
}



// @ts-ignore
const calculationWorker = new CalculationWorker((message: any) => self.postMessage(message));

self.onmessage = (message: { data: WorkerMessage }) => calculationWorker.handleMessage(message.data);

