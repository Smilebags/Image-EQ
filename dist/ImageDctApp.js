import AsyncWorkerPool from "./AsyncWorkerPool.js";
import ImageBuffer from "./ImageBuffer.js";
export default class ImageDctApp {
    constructor(canvasEl, canvasSize, imageUrl, threadCount) {
        this.canvasEl = canvasEl;
        this.canvasSize = canvasSize;
        this.debugMode = false;
        this.frequencyGainFunction = (d, x, y) => 1 - (x + y) / d; //(d < 0.1 || d > 0.2) ? ((x % 0.25) * 10) : 3;
        this.canvasEl.width = this.canvasSize;
        this.canvasEl.height = this.canvasSize;
        this.ctx = this.canvasEl.getContext('2d');
        this.imageElement = new Image();
        this.imageElement.onload = async () => {
            await this.initialise();
        };
        this.imageElement.style.display = 'none';
        document.body.appendChild(this.imageElement);
        this.imageElement.src = imageUrl;
        this.workerPool = new AsyncWorkerPool(threadCount, './worker.js', { type: 'module' });
        const bufferLength = this.canvasSize * this.canvasSize * 4 * 4;
        this.buffers = {
            source: new Float32Array(new SharedArrayBuffer(bufferLength)),
            horizontalDct: new Float32Array(new SharedArrayBuffer(bufferLength)),
            dct: new Float32Array(new SharedArrayBuffer(bufferLength)),
            verticalIdct: new Float32Array(new SharedArrayBuffer(bufferLength)),
            destination: new Float32Array(new SharedArrayBuffer(bufferLength)),
        };
    }
    async draw() {
        await this.doDctOperation('dct', 'row', 'source', 'horizontalDct');
        this.debugMode && this.drawBufferToCanvas(this.buffers.horizontalDct);
        await this.doDctOperation('dct', 'column', 'horizontalDct', 'dct');
        this.debugMode && this.drawBufferToCanvas(this.buffers.dct);
        this.applyFrequencyTransform();
        this.debugMode && this.drawBufferToCanvas(this.buffers.dct);
        await this.doDctOperation('idct', 'column', 'dct', 'verticalIdct');
        this.debugMode && this.drawBufferToCanvas(this.buffers.verticalIdct);
        await this.doDctOperation('idct', 'row', 'verticalIdct', 'destination');
        this.drawBufferToCanvas(this.buffers.destination);
    }
    setDebugMode(isDebugMode) {
        this.debugMode = isDebugMode;
    }
    setFrequencyGainFunction(fn) {
        this.frequencyGainFunction = fn;
    }
    async initialise() {
        this.drawImageToCanvas(this.imageElement);
        const sourceImageData = this.ctx.getImageData(0, 0, this.canvasSize, this.canvasSize);
        for (let i = 0; i < sourceImageData.data.length; i++) {
            this.buffers.source[i] = sourceImageData.data[i];
        }
        await Promise.all(Object.entries(this.buffers).map(async ([key, value]) => {
            return this.workerPool.sendToEach({
                payload: {
                    width: this.canvasSize,
                    height: this.canvasSize,
                    name: key,
                    buffer: value,
                },
                operation: 'setBuffer',
            });
        }));
    }
    applyFrequencyTransform() {
        const dctImageBuffer = new ImageBuffer(this.canvasSize, this.canvasSize, this.buffers.dct);
        this.forEachPixel((x, y) => {
            if (x === 0 && y === 0) {
                return;
            }
            const diagonalDistance = ((this.canvasSize ** 2) * 2) ** 0.5;
            const distance = (((x / diagonalDistance) ** 2) + ((y / diagonalDistance) ** 2)) ** 0.5;
            const scalingFactor = this.frequencyGainFunction(distance, x / this.canvasSize, y / this.canvasSize);
            const applyTransformationToChannel = (channel) => {
                const scaled = dctImageBuffer.getChannelValue(channel, x, y) * scalingFactor;
                dctImageBuffer.setChannelValue(scaled, channel, x, y);
            };
            applyTransformationToChannel(0);
            applyTransformationToChannel(1);
            applyTransformationToChannel(2);
        });
    }
    forEachPixel(callback) {
        for (let y = 0; y < this.canvasSize; y++) {
            for (let x = 0; x < this.canvasSize; x++) {
                callback(x, y);
            }
        }
    }
    async doDctOperation(operation, orientation, sourceBufferName, destinationBufferName) {
        const messages = [];
        for (let index = 0; index < this.canvasSize; index++) {
            for (let channel = 0; channel < 3; channel++) {
                messages.push({
                    operation,
                    payload: {
                        channel: channel,
                        index,
                        orientation,
                        sourceBufferName,
                        destinationBufferName,
                    },
                });
            }
        }
        await this.workerPool.postMessages(messages);
    }
    drawBufferToCanvas(buffer) {
        const imageData = new ImageData(this.canvasSize, this.canvasSize);
        for (let i = 0; i < buffer.length; i++) {
            const value = i % 4 === 3 ? 255 : buffer[i];
            imageData.data[i] = value;
        }
        this.ctx.putImageData(imageData, 0, 0);
    }
    drawImageToCanvas(imageElement) {
        const w = imageElement.naturalWidth;
        const h = imageElement.naturalHeight;
        const minSideWidth = Math.min(w, h);
        const sx = (w / 2) - (minSideWidth / 2);
        const sy = (h / 2) - (minSideWidth / 2);
        const swidth = minSideWidth;
        const sheight = minSideWidth;
        this.ctx.drawImage(imageElement, sx, sy, swidth, sheight, 0, 0, this.canvasSize, this.canvasSize);
    }
}
