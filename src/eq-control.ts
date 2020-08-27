import { canvasSize } from './constants.js';
import { distSq, mapping, lerp } from './utils.js';

var eqHeight = canvasSize / 2;
var eqWidth = canvasSize;

var eqElement = <HTMLCanvasElement>document.getElementById("eq");
var eqContext = eqElement.getContext('2d')!;

class EqPoint {
  constructor(
    private x: number,
    private y: number,
  ) { }

  setX(setVal: number) {
    this.x = setVal;
    return setVal;
  };

  setY(setVal: number) {
    this.y = setVal;
    return setVal;
  };

  getX() {
    return this.x;
  }

  getY() {
    return this.y;
  }
}

export var points: EqPoint[] = [];
for (var i = 0; i < 7; i++) {
  points[i] = new EqPoint((i + 1) / 8, 0.5);
}

window.addEventListener('load', function () {
  drawEq(eqContext);
  eqElement.addEventListener("click", function (event) {
    var closestPoint = nearestPoint(event.offsetX / eqWidth, event.offsetY / eqHeight);
    closestPoint.setX(event.offsetX / eqWidth);
    closestPoint.setY(event.offsetY / eqHeight);
    drawEq(eqContext);
  }, true);

});

function resetEqPoints() {
  for (var i = 0; i < 7; i++) {
    points[i].setX((i + 1) / 8);
    points[i].setY(0.5);
  };
  drawEq(eqContext);
}

function drawEq(eqContext: CanvasRenderingContext2D) {
  eqContext.fillStyle = "#333333";
  eqContext.fillRect(0, 0, eqWidth, eqHeight);
  eqContext.fillStyle = "#666666";
  for (var i = 0; i < points.length; i++) {
    eqContext.beginPath();
    eqContext.arc(points[i].getX() * eqWidth, points[i].getY() * eqHeight, 4, 0, Math.PI * 2, false);
    eqContext.fill();
  }
  eqContext.beginPath();
  for (var i = 0; i < points.length; i++) {
    eqContext.lineTo(points[i].getX() * eqWidth, points[i].getY() * eqHeight);
  }
  eqContext.stroke();
}

function nearestPoint(x: number, y: number) {
  var leadingDist = 10000000;
  var leadingElement;
  for (var i = 0; i < points.length; i++) {
    var dist = distSq([points[i].getX(), points[i].getY()], [x, y]);
    if (dist < leadingDist) {
      leadingDist = dist;
      leadingElement = points[i];
    };
  };
  return leadingElement as EqPoint;
};

export function sample(input: number, points: EqPoint[]): number {
  var tooFar = false;
  var upperPointIndex = 0;
  //need to sort points array by x
  for (var i = 0; i < points.length; i++) {
    var pointXPos = points[i].getX();
    if (input <= pointXPos) {
      upperPointIndex = i;
      break;
    }
  }
  var firstLerpPoint = upperPointIndex > 0 ? mapping(points[upperPointIndex - 1].getY(), 0, 1, 2, 0) : 1;
  var secondLerpPoint = mapping(points[upperPointIndex].getY(), 0, 1, 2, 0);
  var lerpPercent = upperPointIndex > 0 ?
    mapping(input, points[upperPointIndex - 1].getX(), points[upperPointIndex].getX(), 0, 1) :
    mapping(input, 0, points[upperPointIndex].getX(), 0, 1);
  var returnValue = lerp(firstLerpPoint, secondLerpPoint, lerpPercent);
  return returnValue;
}




