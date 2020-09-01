import AsyncWorkerPool from "./AsyncWorkerPool.js";
import ImageBuffer from "./ImageBuffer.js";
import { ChannelIndex } from "./interfaces.js";
import { WorkerMessage } from "./worker.js";

export default class ImageDctApp {
  debugMode = false;
  ctx: CanvasRenderingContext2D;
  imageElement: HTMLImageElement;
  workerPool: AsyncWorkerPool;
  buffers: {
    source: Float32Array;
    horizontalDct: Float32Array;
    dct: Float32Array;
    verticalIdct: Float32Array;
    destination: Float32Array;
  };
  constructor(
    private canvasEl: HTMLCanvasElement,
    private canvasSize: number,
    imageUrl: string,
    threadCount: number,
  ) {
    this.ctx = this.canvasEl.getContext('2d')!;
    this.imageElement = new Image();
    this.imageElement.onload = async () => {
      await this.initialise();
      this.draw();
    };
    this.imageElement.style.display = 'none';
    document.body.appendChild(this.imageElement);
    this.imageElement.src = imageUrl;
    this.workerPool = new AsyncWorkerPool(threadCount, './worker.js', { type: 'module' });

    const bufferLength = this.canvasSize * this.canvasSize * 4 * 4;
    this.buffers = {
      source: new Float32Array(new SharedArrayBuffer(bufferLength)),
      horizontalDct: new Float32Array(new SharedArrayBuffer(bufferLength)),
      dct: new Float32Array(new SharedArrayBuffer(bufferLength)),
      verticalIdct: new Float32Array(new SharedArrayBuffer(bufferLength)),
      destination: new Float32Array(new SharedArrayBuffer(bufferLength)),
    };
  }

  async draw() {
    await this.doDctOperation('dct', 'row', 'source', 'horizontalDct');
    if(this.debugMode) {
      this.drawBufferToCanvas(this.buffers.horizontalDct);
    }
    await this.doDctOperation('dct', 'column', 'horizontalDct', 'dct');
    if (this.debugMode) {
      this.drawBufferToCanvas(this.buffers.dct);
    }

    this.applyFrequencyTransform();
    if (this.debugMode) {
      this.drawBufferToCanvas(this.buffers.dct);
    }

    await this.doDctOperation('idct', 'column', 'dct', 'verticalIdct');
    if (this.debugMode) {
      this.drawBufferToCanvas(this.buffers.verticalIdct);
    }
    await this.doDctOperation('idct', 'row', 'verticalIdct', 'destination');
    this.drawBufferToCanvas(this.buffers.destination);
  }

  private async initialise() {
    this.drawImageToCanvas(this.imageElement);
    const sourceImageData = this.ctx.getImageData(0, 0, this.canvasSize, this.canvasSize);
    
    for (let i = 0; i < sourceImageData.data.length; i++) {
      this.buffers.source[i] = sourceImageData.data[i];
    }

    await Promise.all(Object.entries(this.buffers).map(async ([key, value]) => {
      return this.workerPool.sendToEach({
        payload: {
          width: this.canvasSize,
          height: this.canvasSize,
          name: key,
          buffer: value,
        },
        operation: 'setBuffer',
      });
    }));
  }


  private applyFrequencyTransform() {
    const dctImageBuffer = new ImageBuffer(this.canvasSize, this.canvasSize, this.buffers.dct);
    this.forEachPixel((x, y) => {
      if (x === 0 && y === 0) {
        return;
      }
      const distance = (((x / this.canvasSize) ** 2) + ((y / this.canvasSize) ** 2)) ** 0.5;
      function applyTransformationToChannel(channel: ChannelIndex) {
        const value = dctImageBuffer.getChannelValue(channel, x, y);
        const factor = distance;
        const scaled = value * factor;
        dctImageBuffer.setChannelValue(scaled, channel, x, y);
      }

      applyTransformationToChannel(0);
      applyTransformationToChannel(1);
      applyTransformationToChannel(2);
    });
  }

  private forEachPixel(callback: (x: number, y: number) => any): void {
    for (let y = 0; y < this.canvasSize; y++) {
      for (let x = 0; x < this.canvasSize; x++) {
        callback(x, y);
      }
    }
  }

  private async doDctOperation(
    operation: 'dct' | 'idct',
    orientation: 'row' | 'column',
    sourceBufferName: string,
    destinationBufferName: string,
    ) {
    const messages: WorkerMessage[] = [];
    for (let index = 0; index < this.canvasSize; index++) {
      for (let channel = 0; channel < 3; channel++) {
        messages.push({
          operation,
          payload: {
            channel: channel as ChannelIndex,
            index,
            orientation,
            sourceBufferName,
            destinationBufferName,
          },
        });
      }
    }
    await this.workerPool.postMessages(messages);
  }

  private drawBufferToCanvas(buffer: Float32Array) {
    const imageData = new ImageData(this.canvasSize, this.canvasSize);
    for (let i = 0; i < buffer.length; i++) {
      const value = i % 4 === 3 ? 255 : buffer[i];
      imageData.data[i] = value;
    }
    this.ctx.putImageData(imageData, 0, 0);
  }

  private drawImageToCanvas(imageElement: HTMLImageElement): void {
    const w = imageElement.naturalWidth;
    const h = imageElement.naturalHeight;
    const minSideWidth = Math.min(w, h);
    const sx = (w / 2) - (minSideWidth / 2);
    const sy = (h / 2) - (minSideWidth / 2);
    const swidth = minSideWidth;
    const sheight = minSideWidth;
    this.ctx.drawImage(
      imageElement,
      sx,
      sy,
      swidth,
      sheight,
      0,
      0,
      this.canvasSize,
      this.canvasSize,
    );
  }
}