import AsyncWorkerPool from "./AsyncWorkerPool.js";
import { canvasSize, threadCount } from "./constants.js";
import { drawImageToCanvas, drawBuffer } from "./canvasUtils.js";
import ImageBuffer from "./ImageBuffer.js";
import { ChannelIndex } from "./interfaces.js";
import { WorkerMessage } from "./worker.js";

const asyncWorkerPool = new AsyncWorkerPool(4, './worker.js', { type: 'module' });

const c: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById("canvasElement");
const ctx = c.getContext("2d")!;


var imageElement = document.querySelector('#imageViewer') as HTMLImageElement;
imageElement.onload = main;
imageElement.src = './Default.jpg';

async function main() {
  drawImageToCanvas(imageElement, ctx);
  const sourceImageData = ctx.getImageData(0, 0, canvasSize, canvasSize);
  const bufferLengths = sourceImageData.data.length * 4;
  
  const buffers = {
    source: new Float32Array(new SharedArrayBuffer(bufferLengths)),
    horizontalDct: new Float32Array(new SharedArrayBuffer(bufferLengths)),
    dct: new Float32Array(new SharedArrayBuffer(bufferLengths)),
    verticalIdct: new Float32Array(new SharedArrayBuffer(bufferLengths)),
    destination: new Float32Array(new SharedArrayBuffer(bufferLengths)),
  };

  for (let i = 0; i < sourceImageData.data.length; i++) {
    buffers.source[i] = sourceImageData.data[i];
  }

  await Promise.all(Object.entries(buffers).map(async ([key, value]) => {
    return asyncWorkerPool.sendToEach({
      payload: {
        width: sourceImageData.width,
        height: sourceImageData.height,
        name: key,
        buffer: value,
      },
      operation: 'setBuffer',
    });
  }));


  async function doDct() {
    console.time('iteration');
    await doDctOperation('dct', 'row', 'source', 'horizontalDct');
    await doDctOperation('dct', 'column', 'horizontalDct', 'dct');

    const dctImageBuffer = new ImageBuffer(canvasSize, canvasSize, buffers.dct);
    for (let y = 0; y < canvasSize; y++) {
      for (let x = 0; x < canvasSize; x++) {
        if (x === 0 && y === 0) {
          continue;
        }
        const distance = (((x / canvasSize) ** 2) + ((y / canvasSize) ** 2)) ** 0.5;
        function applyTransformation(channel: ChannelIndex) {
          const value = dctImageBuffer.getChannelValue(channel, x, y);
          const factor = distance;
          const scaled = value * factor;
          dctImageBuffer.setChannelValue(scaled, channel, x, y);
        }

        applyTransformation(0);
        applyTransformation(1);
        applyTransformation(2);
      }
    }

    await doDctOperation('idct', 'column', 'dct', 'verticalIdct');
    await doDctOperation('idct', 'row', 'verticalIdct', 'destination');
    drawBuffer(buffers.destination, ctx);
    console.timeEnd('iteration');
  }

  await doDct();
}


async function doDctOperation(
  operation: 'dct' | 'idct',
  orientation: 'row' | 'column',
  sourceBufferName: string,
  destinationBufferName: string,
  ) {
  const messages: WorkerMessage[] = [];
  for (let index = 0; index < canvasSize; index++) {
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
  await asyncWorkerPool.postMessages(messages);
}