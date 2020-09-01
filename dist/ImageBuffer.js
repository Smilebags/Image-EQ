export default class ImageBuffer {
    constructor(width, height, buffer) {
        this.width = width;
        this.height = height;
        this.buffer = buffer;
    }
    getIndex(channel, x, y) {
        return (((this.width * y) + x) * 4) + channel;
    }
    getChannelValue(channel, x, y) {
        return this.buffer[this.getIndex(channel, x, y)];
    }
    setChannelValue(value, channel, x, y) {
        this.buffer[this.getIndex(channel, x, y)] = value;
    }
    getChannelRow(channel, rowIndex) {
        const result = new Float32Array(this.width);
        for (let i = 0; i < this.width; i++) {
            result[i] = this.getChannelValue(channel, i, rowIndex);
        }
        return result;
    }
    getChannelColumn(channel, columnIndex) {
        const result = new Float32Array(this.height);
        for (let i = 0; i < this.height; i++) {
            result[i] = this.getChannelValue(channel, columnIndex, i);
        }
        return result;
    }
    setChannelRow(values, channel, rowIndex) {
        if (values.length !== this.width) {
            return;
        }
        for (let i = 0; i < this.width; i++) {
            this.setChannelValue(values[i], channel, i, rowIndex);
        }
    }
    setChannelColumn(values, channel, columnIndex) {
        if (values.length !== this.width) {
            return;
        }
        for (let i = 0; i < this.width; i++) {
            this.setChannelValue(values[i], channel, columnIndex, i);
        }
    }
}
