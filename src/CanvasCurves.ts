import { distSq, mapping, lerp } from './utils.js';

interface EqPoint {
  x: number;
  y: number;
}
export class CanvasCurves {
  private ctx = this.canvasEl.getContext('2d')!;
  private points: EqPoint[];
  private clickCallbacks: Function[] = [];
  constructor(
    private canvasEl: HTMLCanvasElement,
    private width: number,
    private height: number,
  ) {
    this.canvasEl.width = width;
    this.canvasEl.height = height;

    this.points = [];
    for (let i = 0; i < 9; i++) {
      this.points.push({x: i / 8, y: 0.5});
    }

    this.canvasEl.addEventListener("click", (e) => this.handleClick(e), true);
    this.draw();
  }

  sample(input: number): number {
    if (input === 0) {
      return this.points[0].y;
    }
    if (input >= 1) {
      return this.points[8].y;
    }
    const lowIndex = Math.floor(input * 8);
    const lowValue = this.points[lowIndex].y;
    const highValue = this.points[lowIndex + 1].y;
    const progress = input % (1 / 8);
    return lerp(lowValue, highValue, progress);
  }

  addClickListener(callback: Function) {
    this.clickCallbacks.push(callback);
  }

  private handleClick(clickEvent: MouseEvent) {
    const closestPoint = this.nearestPoint(clickEvent.offsetX / this.width);
    closestPoint.y = 1 - (clickEvent.offsetY / this.height);
    this.draw();
    this.callClickCallbacks();
  }

  private callClickCallbacks() {
    this.clickCallbacks.forEach(cb => cb());
  }

  private draw() {
    this.ctx.fillStyle = "#333333";
    this.ctx.fillRect(0, 0, this.width, this.height);
    this.ctx.fillStyle = "#666666";
    for (var i = 0; i < this.points.length; i++) {
      this.ctx.beginPath();
      this.ctx.arc(this.points[i].x * this.width, (1 - this.points[i].y) * this.height, 4, 0, Math.PI * 2, false);
      this.ctx.fill();
    }
    this.ctx.beginPath();
    for (var i = 0; i < this.points.length; i++) {
      this.ctx.lineTo(this.points[i].x * this.width, (1 - this.points[i].y) * this.height);
    }
    this.ctx.stroke();
  }

  private nearestPoint(position: number): EqPoint {
    const leftSide = Math.floor(position * 8);
    if (position % (1/8) < (1/16)) {
      return this.points[leftSide];
    }
    return this.points[leftSide + 1];
  };

}

