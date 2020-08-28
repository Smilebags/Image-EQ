// import { DCT, IDCT } from "./dct.js";

import { DCTMessage, WorkerMessage, WorkerResponse } from "./worker";

const buf = new SharedArrayBuffer(8*4);
const arr = new Float32Array(buf);

for (let i = 0; i < arr.length; i++) {
  arr[i] = i;
}

const worker = new Worker('./worker.js', { type: "module" });

worker.addEventListener('message', message => handleMessage(message))

const message: WorkerMessage = {
  payload: arr,
  operation: 'setSourceBuffer',
};
worker.postMessage(message);



function handleMessage(message: { data: WorkerResponse }) {
  console.log(message.data);
  if(message.data === 'done') {
    const dctMessage: DCTMessage = {
      operation: 'dct',
      payload: null,
    };
    worker.postMessage(dctMessage);
  }
}

setTimeout(() => {
  for (let i = 0; i < arr.length; i++) {
    arr[i] = i * 2;
  }
}, 1000);