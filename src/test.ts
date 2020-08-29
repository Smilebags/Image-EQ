import { canvasSize } from "./constants.js";
import { DCT, DCTInPlace } from "./dct.js";
import ImageBuffer from "./ImageBuffer.js";
import { sleep } from "./utils.js";

import { DCTMessage, WorkerMessage, WorkerResponse } from "./worker";


const worker = new Worker('./worker.js', { type: "module" });

worker.addEventListener('message', message => handleMessage(message))

function handleMessage(message: { data: WorkerResponse }) {
  console.log(message.data);
}

var c: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById("canvasElement");
var ctx = c.getContext("2d")!;

var imageElement = document.querySelector('#imageViewer') as HTMLImageElement;
imageElement.onload = async function () {
  drawImageToCanvas(imageElement);
  const sourceImageData = ctx.getImageData(0, 0, canvasSize, canvasSize);
  console.log(sourceImageData);
  const sourceBuffer = new SharedArrayBuffer(sourceImageData.data.length * 4);
  const sourceArr = new Float32Array(sourceBuffer);
  for (let i = 0; i < sourceImageData.data.length; i++) {
    sourceArr[i] = sourceImageData.data[i];
  }
  console.log(sourceArr);

  const destinationBuffer = new SharedArrayBuffer(sourceImageData.data.length * 4);
  const destinationArr = new Float32Array(destinationBuffer);


  const message: WorkerMessage = {
    payload: {
      width: sourceImageData.width,
      height: sourceImageData.height,
      name: 'source',
      buffer: sourceArr,
    },
    operation: 'setBuffer',
  };
  worker.postMessage(message);

  const destinationMessage: WorkerMessage = {
    payload: {
      width: sourceImageData.width,
      height: sourceImageData.height,
      name: 'destination',
      buffer: destinationArr,
    },
    operation: 'setBuffer',
  };
  worker.postMessage(destinationMessage);
  await sleep(500);

  for (let index = 0; index < canvasSize; index++) {
    for (let channel = 0; channel < 3; channel++) {
      worker.postMessage({
        operation: 'dct',
        payload: {
          channel,
          index,
          orientation: 'row',
          sourceBufferName: 'source',
          destinationBufferName: 'destination',
        },
      });
    }
  }


  await sleep(5000);
  const destinationImageData = new ImageData(canvasSize, canvasSize);
  for (let i = 0; i < destinationArr.length; i++) {
    const value = i % 4 === 3 ? 255 : destinationArr[i];
    destinationImageData.data[i] = value;
  }
  ctx.putImageData(destinationImageData, 0, 0);  

}


imageElement.src = './Default.jpg';




// const buf = new SharedArrayBuffer(8*8*4*4);
// const arr = new Float32Array(buf);
// for (let i = 0; i < arr.length; i++) {
//   arr[i] = i;
// }
// const dest = new Float32Array(arr.length);
// console.log(DCT(arr));
// DCTInPlace(arr, dest);
// console.log(dest);







function drawImageToCanvas(imageElement: HTMLImageElement): void {
  var w = imageElement.naturalWidth;
  var h = imageElement.naturalHeight;
  var min = Math.min(w, h);
  var sx = (w / 2) - (min / 2);
  var sy = (h / 2) - (min / 2);
  var swidth = min;
  var sheight = min;
  var x = 0;
  var y = 0;
  var width = canvasSize;
  var height = canvasSize;
  ctx.drawImage(imageElement, sx, sy, swidth, sheight, x, y, width, height);
}
