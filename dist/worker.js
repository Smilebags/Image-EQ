import { DCTInPlace, IDCTInPlace } from './dct.js';
import ImageBuffer from './ImageBuffer.js';
class CalculationWorker {
    constructor(postMessage) {
        this.postMessage = postMessage;
        this.buffers = {};
    }
    handleMessage(message) {
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
        });
    }
    handleSetSourceBufferMessage(payload) {
        this.buffers[payload.name] = new ImageBuffer(payload.width, payload.height, payload.buffer);
    }
    handleDCTMessage(payload) {
        if (!this.buffers[payload.sourceBufferName]) {
            return;
        }
        if (payload.orientation === 'row') {
            this.rowDCT(payload.channel, payload.index, this.buffers[payload.sourceBufferName], this.buffers[payload.destinationBufferName]);
        }
        else {
            this.columnDCT(payload.channel, payload.index, this.buffers[payload.sourceBufferName], this.buffers[payload.destinationBufferName]);
        }
    }
    handleIDCTMessage(payload) {
        if (!this.buffers[payload.sourceBufferName]) {
            return;
        }
        if (payload.orientation === 'row') {
            this.rowIDCT(payload.channel, payload.index, this.buffers[payload.sourceBufferName], this.buffers[payload.destinationBufferName]);
        }
        else {
            this.columnIDCT(payload.channel, payload.index, this.buffers[payload.sourceBufferName], this.buffers[payload.destinationBufferName]);
        }
    }
    rowDCT(channel, index, sourceBuffer, destinationBuffer) {
        const source = sourceBuffer.getChannelRow(channel, index);
        const dest = new Float32Array(source.length);
        DCTInPlace(source, dest);
        destinationBuffer.setChannelRow(dest, channel, index);
    }
    columnDCT(channel, index, sourceBuffer, destinationBuffer) {
        const source = sourceBuffer.getChannelColumn(channel, index);
        const dest = new Float32Array(source.length);
        DCTInPlace(source, dest);
        destinationBuffer.setChannelColumn(dest, channel, index);
    }
    rowIDCT(channel, index, sourceBuffer, destinationBuffer) {
        const source = sourceBuffer.getChannelRow(channel, index);
        const dest = new Float32Array(source.length);
        IDCTInPlace(source, dest);
        destinationBuffer.setChannelRow(dest, channel, index);
    }
    columnIDCT(channel, index, sourceBuffer, destinationBuffer) {
        const source = sourceBuffer.getChannelColumn(channel, index);
        const dest = new Float32Array(source.length);
        IDCTInPlace(source, dest);
        destinationBuffer.setChannelColumn(dest, channel, index);
    }
    sendMessage(message) {
        this.postMessage(message);
    }
}
// @ts-ignore
const calculationWorker = new CalculationWorker((message) => self.postMessage(message));
self.onmessage = (message) => calculationWorker.handleMessage(message.data);
