import { canvasSize, threadCount } from "./constants.js";
import ImageDctApp from "./ImageDctApp.js";
import { CanvasCurves } from './CanvasCurves.js';

const eqEl: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById("eq2");
const canvasCurves = new CanvasCurves(eqEl, canvasSize, canvasSize / 2);
const canvasEl: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById("canvasElement");
const app = new ImageDctApp(canvasEl, canvasSize, './Default.jpg', threadCount);
app.setFrequencyGainFunction(d => canvasCurves.sample(d ** (1/3)) * 2);
canvasCurves.addClickListener(() => {
  app.draw();
});