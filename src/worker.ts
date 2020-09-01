import { DCT, DCTInPlace, IDCT, IDCTInPlace } from './dct.js';
import ImageBuffer from './ImageBuffer.js';
import { ChannelIndex } from './interfaces.js';

interface WorkerMessageBase {
  operation: string;
  payload: any;
  messageId?: number;
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

export interface IDCTMessage extends WorkerMessageBase {
  operation: 'idct';
  payload: {
    orientation: 'row' | 'column';
    index: number;
    channel: ChannelIndex;
    sourceBufferName: string;
    destinationBufferName: string;
  };
}
export type WorkerMessage = SetSourceBufferMessage | DCTMessage | IDCTMessage;

export interface WorkerResponse {
  values: number[];
}

class CalculationWorker {
  buffers: { [bufferName: string]: ImageBuffer } = {};

  constructor(
    private postMessage: Function,
  ) {}


  handleMessage(message: WorkerMessage) {
    let response;
    switch (message.operation) {
      case 'setBuffer':
        this.handleSetSourceBufferMessage(message.payload);
        break;
      case 'dct':
        this.handleDCTMessage(message.payload);
        break;
      case 'idct':
        this.handleIDCTMessage(message.payload);
        break;
      default:
        break;
    }
    this.sendMessage({
      messageId: message.messageId,
      body: response,
    })
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
    } else {
        this.columnDCT(
          payload.channel,
          payload.index,
          this.buffers[payload.sourceBufferName],
            this.buffers[payload.destinationBufferName],
      );
    }
  }

  
  private handleIDCTMessage(payload: DCTMessage['payload']) {
    if (!this.buffers[payload.sourceBufferName]) {
      return;
    }
    if (payload.orientation === 'row') {
      this.rowIDCT(
        payload.channel,
        payload.index,
        this.buffers[payload.sourceBufferName],
        this.buffers[payload.destinationBufferName],
      );
    } else {
        this.columnIDCT(
          payload.channel,
          payload.index,
          this.buffers[payload.sourceBufferName],
            this.buffers[payload.destinationBufferName],
      );
    }
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
  }

  private columnDCT(
    channel: ChannelIndex,
    index: number,
    sourceBuffer: ImageBuffer,
    destinationBuffer: ImageBuffer,
  ) {
    const source = sourceBuffer.getChannelColumn(channel, index);
    const dest = new Float32Array(source.length);
    DCTInPlace(source, dest);
    destinationBuffer.setChannelColumn(dest, channel, index);
  }

  
  private rowIDCT(
    channel: ChannelIndex,
    index: number,
    sourceBuffer: ImageBuffer,
    destinationBuffer: ImageBuffer,
  ) {
    const source = sourceBuffer.getChannelRow(channel, index);
    const dest = new Float32Array(source.length);
    IDCTInPlace(source, dest);
    destinationBuffer.setChannelRow(dest, channel, index);
  }

  private columnIDCT(
    channel: ChannelIndex,
    index: number,
    sourceBuffer: ImageBuffer,
    destinationBuffer: ImageBuffer,
  ) {
    const source = sourceBuffer.getChannelColumn(channel, index);
    const dest = new Float32Array(source.length);
    IDCTInPlace(source, dest);
    destinationBuffer.setChannelColumn(dest, channel, index);
  }

  private sendMessage(message: any) {
    this.postMessage(message);
  }
}



// @ts-ignore
const calculationWorker = new CalculationWorker((message: any) => self.postMessage(message));

self.onmessage = (message: { data: WorkerMessage }) => calculationWorker.handleMessage(message.data);

