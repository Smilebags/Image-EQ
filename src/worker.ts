import { DCT, DCTInPlace, IDCT } from './dct.js';
import ImageBuffer from './ImageBuffer.js';
import { ChannelIndex } from './interfaces.js';

interface WorkerMessageBase {
  operation: string;
  payload: any;
}

export interface SetSourceBufferMessage extends WorkerMessageBase {
  operation: 'setBuffer';
  payload: {
    name: string;
    width: number;
    height: number;
    buffer: Float32Array;
  };
}
export interface DCTMessage extends WorkerMessageBase {
  operation: 'dct';
  payload: {
    orientation: 'row' | 'column';
    index: number;
    channel: ChannelIndex;
    sourceBufferName: string;
    destinationBufferName: string;
  };
}

export type WorkerMessage = SetSourceBufferMessage | DCTMessage;

export interface WorkerResponse {
  values: number[];
}

class CalculationWorker {
  buffers: { [bufferName: string]: ImageBuffer } = {};

  constructor(
    private postMessage: Function,
  ) {}


  handleMessage(message: WorkerMessage) {
    switch (message.operation) {
      case 'setBuffer':
        this.handleSetSourceBufferMessage(message.payload);
        break;
      case 'dct':
        this.handleDCTMessage(message.payload);
        break;
      default:
        break;
    }
  }

  private handleSetSourceBufferMessage(payload: SetSourceBufferMessage['payload']) {
    this.buffers[payload.name] = new ImageBuffer(payload.width, payload.height,  payload.buffer);
  }

  private handleDCTMessage(payload: DCTMessage['payload']) {
    if (!this.buffers[payload.sourceBufferName]) {
      return;
    }
    if (payload.orientation === 'row') {
      this.rowDCT(
        payload.channel,
        payload.index,
        this.buffers[payload.sourceBufferName],
        this.buffers[payload.destinationBufferName],
      );
    }
    //   else {
    //     this.columnDCT(
    //       payload.channel,
    //       payload.index,
    //       this.buffers[payload.sourceBufferName],
    //         this.buffers[payload.destinationBufferName],
    //   );
    // }
  }

  private rowDCT(
    channel: ChannelIndex,
    index: number,
    sourceBuffer: ImageBuffer,
    destinationBuffer: ImageBuffer,
  ) {
    const source = sourceBuffer.getChannelRow(channel, index);
    const dest = new Float32Array(source.length);
    DCTInPlace(source, dest);
    destinationBuffer.setChannelRow(dest, channel, index);
    // this.sendMessage({
    //   channel,
    //   index,
    //   sourceBuffer,
    //   destinationBuffer,
    // });
  }



  sendMessage(message: any) {
    this.postMessage(message);
  }
}



// @ts-ignore
const calculationWorker = new CalculationWorker((message: any) => self.postMessage(message));

self.onmessage = (message: { data: WorkerMessage }) => calculationWorker.handleMessage(message.data);

