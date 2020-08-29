import { ChannelIndex } from "./interfaces";

export default class ImageBuffer {
  constructor(
    public width: number,
    public height: number,
    public buffer: Float32Array,
  ) {}

  getIndex(channel: ChannelIndex, x: number, y: number): number {
    return (((this.width * y) + x) * 4) + channel;
  }

  getChannelValue(channel: ChannelIndex, x: number, y: number): number {
    return this.buffer[this.getIndex(channel, x, y)];
  }

  setChannelValue(value: number, channel: ChannelIndex, x: number, y: number): void {
    this.buffer[this.getIndex(channel, x, y)] = value;
  }

  getChannelRow(channel: ChannelIndex, rowIndex: number): Float32Array {
    const result = new Float32Array(this.width);
    for (let i = 0; i < this.width; i++) {
      result[i] = this.getChannelValue(channel, i, rowIndex);
    }
    return result;
  }

  getChannelColumn(channel: ChannelIndex, columnIndex: number): Float32Array {
    const result = new Float32Array(this.height);
    for (let i = 0; i < this.height; i++) {
      result[i] = this.getChannelValue(channel, columnIndex, i);
    }
    return result;
  }

  setChannelRow(values: Float32Array, channel: ChannelIndex, rowIndex: number): void {
    if(values.length !== this.width) {
      return;
    }
    for (let i = 0; i < this.width; i++) {
      this.setChannelValue(values[i], channel, i, rowIndex)
    }
  }
}