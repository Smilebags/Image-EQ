/// <reference path="eq-control.ts"/>

import * as calc from "./calculation.js";
import "./eq-control.js";
import { canvasSize } from './constants.js';
import { points, sample } from "./eq-control.js";

var c: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById("canvasElement");
var ctx = c.getContext("2d")!;

// var dctData: DCTData;
var IDCTData = new ImageData(canvasSize, canvasSize);
var imageData = new ImageData(canvasSize, canvasSize);
// var mappedDCTData: DCTData;

// var imageElement = document.querySelector('#imageViewer') as HTMLImageElement;
// imageElement.onload = function () {
//   drawImageToCanvas(<HTMLImageElement>imageElement);
//   imageData = ctx.getImageData(0, 0, canvasSize, canvasSize);
//   calc.calculateDCT(imageData, (data) => {
//     // We have pressed recalculate and the DCT data has been created
//     // dctData = data;
//     //I don't think we need to do anything else yet
//   });
// }


// trigger the update of the image element when the image loads
// window.addEventListener('DOMContentLoaded', () => {
//   document.querySelector(".upload-prompt")!.addEventListener('click', () => {
//     (document.querySelector("#fileInputLabel")! as HTMLLabelElement).click();
//   });

  // document.querySelector("input[type='range']").addEventListener('change', () => {
  //     mappedDCTData = mapDCTValues(DCTData);
  //     IDCTData = calc.generateIDCT(mappedDCTData);
  //     ctx.putImageData(IDCTData, 0, 0);
  // });

  // initially draw the first image to canvas
  // document.querySelector('#fileInput')!.addEventListener('change', function (ev: Event) {
  //   var f = (ev.target as HTMLInputElement)!.files![0];
  //   var fr = new FileReader();

  //   fr.onload = function (ev2) {
  //     console.dir(ev2);
  //     (document.querySelector('#imageViewer') as HTMLImageElement).src = (ev2.target as FileReader).result as any;
  //     drawImageToCanvas(imageElement);
  //     imageData = ctx.getImageData(0, 0, canvasSize, canvasSize);
  //     calc.calculateDCT(imageData, (data) => {
  //       dctData = data;
  //       mappedDCTData = mapDCTValues(dctData);
  //       IDCTData = calc.generateIDCT(mappedDCTData);
  //       ctx.putImageData(IDCTData, 0, 0);
  //     });

  //   };

  //   fr.readAsDataURL(f);
  // });
  // document.querySelector("#update").addEventListener('click', function () {
  //     mappedDCTData = mapDCTValues(DCTData);
  //     IDCTData = calc.generateIDCT(mappedDCTData);
  //     ctx.putImageData(IDCTData, 0, 0);
  // });
  // document.querySelector("#render")!.addEventListener('click', function () {
  //   mappedDCTData = mapDCTValues(dctData);
  //   IDCTData = calc.generateIDCT(mappedDCTData);
  //   ctx.putImageData(IDCTData, 0, 0);
  // });

  // document.querySelector("#recalculate")!.addEventListener('click', function () {
  //   drawImageToCanvas(imageElement);
  //   imageData = ctx.getImageData(0, 0, canvasSize, canvasSize);
  //   calc.calculateDCT(imageData, (data) => {
      // We have pressed recalculate and the DCT data has been created
      // dctData = data;
      //I don't think we need to do anything else yet
//     });

//   });
// });

// function drawImageDataToCanvas(imageData: ImageData): void {
//   ctx.putImageData(imageData, 0, 0);
// }

// function drawDCTToCanvas(DCT: DCTData): void {
//   var imageData = calc.formatDCTAsImageData(DCT);
//   ctx.putImageData(imageData, 0, 0);
// }




// function mapDCTValues(array: DCTData): DCTData {
//   // data is in form array[x][col][y]
//   var newArray: DCTData = JSON.parse(JSON.stringify(array));
//   // var lo = Number(( <HTMLInputElement> document.querySelector("#freqLo")).value);
//   // var md = Number(( <HTMLInputElement> document.querySelector("#freqMd")).value);
//   // var hi = Number(( <HTMLInputElement> document.querySelector("#freqHi")).value);
//   for (var x = 0; x < canvasSize; x++) {
//     for (var col = 0; col < 3; col++) {
//       for (var y = 0; y < canvasSize; y++) {
//         if (!(x == 0 && y == 0)) {
//           var weight = Math.pow((Math.pow((x / canvasSize), 2) + Math.pow((y / canvasSize), 2)) / Math.sqrt(2), 0.175);
//           //var multValue = weight <= 0.5 ? lerp(lo, md, weight * 2) : lerp(md, hi, (weight * 2) - 1);
//           var multValue = sample(weight, points);
//           // @ts-ignore
//           newArray[x][col][y] *= multValue; //(1 / (x ^ 2 + y ^ 2));
//         }
//       }
//     }
//   }
//   return newArray;
// }












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
