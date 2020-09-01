import { canvasSize } from "./constants.js";

export function drawImageToCanvas(imageElement: HTMLImageElement, ctx: CanvasRenderingContext2D): void {
  const w = imageElement.naturalWidth;
  const h = imageElement.naturalHeight;
  const minSideWidth = Math.min(w, h);
  const sx = (w / 2) - (minSideWidth / 2);
  const sy = (h / 2) - (minSideWidth / 2);
  const swidth = minSideWidth;
  const sheight = minSideWidth;
  const x = 0;
  const y = 0;
  const width = canvasSize;
  const height = canvasSize;
  ctx.drawImage(imageElement, sx, sy, swidth, sheight, x, y, width, height);
}
export function drawBuffer(buffer: Float32Array, ctx: CanvasRenderingContext2D) {
  const imageData = new ImageData(canvasSize, canvasSize);
  for (let i = 0; i < buffer.length; i++) {
    const value = i % 4 === 3 ? 255 : buffer[i];
    imageData.data[i] = value;
  }
  ctx.putImageData(imageData, 0, 0);
}
