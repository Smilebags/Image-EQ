import { canvasSize, threadCount } from "./constants.js";
import ImageDctApp from "./ImageDctApp.js";

const c: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById("canvasElement");
const app = new ImageDctApp(c, canvasSize, './Default.jpg', threadCount);
app.setDebugMode(true);