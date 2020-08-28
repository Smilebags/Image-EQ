import { DCTData } from "interfaces.js";
import { canvasSize } from './constants.js';
import { DCT, IDCT } from './dct.js';

export function calculateDCT(imageData: ImageData, callback: (data: DCTData) => any): void {
  generateDCT(imageData).then((data) => {
    callback(data);
  });
}

export function generateDCT(imageData: ImageData): Promise<DCTData> {
  var DCTRowOutput: number[][][] = [];
  var DCTFinalOutput = new Array();
  for (var i = 0; i < canvasSize; i++) {
    DCTFinalOutput[i] = [[], [], []];
  }

  //this needs to be implemented as a promise I think
  return intelligentDCTCompute(imageData).then((DCTRowOutput) => {
    for (var x = 0; x < canvasSize; x++) {
      for (var col = 0; col < 3; col++) {
        var DCTArray = [];
        for (var y = 0; y < canvasSize; y++) {
          DCTArray.push(DCTRowOutput[y][col][x]);
        }
        var premultipliedDCT = DCT(DCTArray);
        DCTFinalOutput[x][col] = premultipliedDCT;
      }
    }
    return DCTFinalOutput as any;
  });
}



export function generateIDCT(DCTData: DCTData): ImageData {
  var DCTRowOutput: number[][][] = [];
  for (var i = 0; i < canvasSize; i++) {
    DCTRowOutput[i] = [];
  }
  var DCTFinalOutput = [] as DCTData;
  for (var i = 0; i < canvasSize; i++) {
    DCTFinalOutput[i] = [];
  }
  for (var y = 0; y < canvasSize; y++) {
    for (var col = 0; col < 3; col++) {
      var DCTArray = [];
      for (var x = 0; x < canvasSize; x++) {
        DCTArray.push(DCTData[x][col][y]);
      }
      premultipliedDCT = IDCT(DCTArray);
      DCTRowOutput[y][col] = premultipliedDCT;
    }
  }
  //take the vertical IDCT results
  for (var x = 0; x < canvasSize; x++) {
    for (var col = 0; col < 3; col++) {
      var DCTArray = [];
      for (var y = 0; y < canvasSize; y++) {
        DCTArray.push(DCTRowOutput[y][col][x]);
      }
      var premultipliedDCT = IDCT(DCTArray);
      DCTFinalOutput[x][col] = premultipliedDCT;
    }
  }
  var DCTImageData = formatDCTAsImageData(DCTFinalOutput);
  return DCTImageData;
}

//worker based DCT computing 
async function intelligentDCTCompute(imageData: ImageData): Promise<number[][][]> {
  let DCTRowOutput: number[][][] = [];


  if (typeof (Worker) !== "undefined") {
    // expected return:
    // [y][colour] array with the output of that row's DCT
    // split the task at the y level with each worker receiving the section of the input array process
    // 
    // when they have processed all three arrays, return the whole lot with the ID, then close
    // when receiving a message back, add it back in to the final array and check to see if the final array is complete
    // if so, return the array
    let DCTObjectArray = await calculateAllDCT(imageData);
    DCTObjectArray.forEach(item => {
      DCTRowOutput[item.id] = item.pixelArray;
    });
  } else {
    // Sorry! No Web Worker support..
    for (var y = 0; y < canvasSize; y++) {
      for (var col = 0; col < 3; col++) {
        var DCTArray = [];
        for (var x = 0; x < canvasSize; x++) {
          DCTArray.push(Number(imageData.data[(y * 4 * canvasSize) + (x * 4) + col]));
        }
        var premultipliedDCT = DCT(DCTArray);
        DCTRowOutput[y][col] = premultipliedDCT;
      }
    }
  }
  return DCTRowOutput;

  function calculateAllDCT(imageData: ImageData): Promise<{ pixelArray: number[][], id: number }[]> {
    let promises: Promise<{ pixelArray: number[][], id: number }>[] = [];
    for (var y = 0; y < canvasSize; y++) {
      let arraySection: Uint8ClampedArray = imageData.data.slice(y * canvasSize * 4, (y + 1) * canvasSize * 4);
      promises.push(rowDCT(arraySection, y));
    }
    return Promise.all(promises);
  }

  function rowDCT(arraySection: Uint8ClampedArray, id: number): Promise<{ pixelArray: number[][], id: number }> {
    return new Promise(function (resolve) {
      let worker = new Worker("/worker.js");
      worker.onmessage = function (message: { data: { pixelArray: number[][], id: number } }) {
        worker.terminate();
        console.log(message.data.id);
        resolve(message.data);
        DCTRowOutput[message.data.id] = message.data.pixelArray;
      };
      worker.postMessage({ pixelArray: arraySection, id: id });
    })
  }
}

export function formatDCTAsImageData(DCT: DCTData): ImageData {
  var imageData = new ImageData(canvasSize, canvasSize);
  for (var x = 0; x < canvasSize; x++) {
    for (var y = 0; y < canvasSize; y++) {
      for (var col = 0; col < 4; col++) {
        imageData.data[(x * canvasSize * 4) + (y * 4) + col] = col != 3 ? DCT[y][col][x] : 255;
      }
    }
  }
  return imageData;
}