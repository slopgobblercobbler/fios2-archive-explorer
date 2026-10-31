/**
 * BinaryReader - Safe DataView wrapper for parsing PlayStation binary formats (PSARC / PFS)
 * Supports Big-Endian and Little-Endian parsing, 40-bit integers, and hex formatting.
 */

export class BinaryReader {
  /**
   * @param {ArrayBuffer|Uint8Array} data
   * @param {number} [byteOffset=0]
   * @param {number} [byteLength]
   */
  constructor(data, byteOffset = 0, byteLength) {
    if (data instanceof Uint8Array) {
      this.buffer = data.buffer;
      this.baseOffset = data.byteOffset + byteOffset;
      this.length = byteLength !== undefined ? byteLength : data.byteLength - byteOffset;
    } else if (data instanceof ArrayBuffer) {
      this.buffer = data;
      this.baseOffset = byteOffset;
      this.length = byteLength !== undefined ? byteLength : data.byteLength - byteOffset;
    } else {
      throw new TypeError('Expected ArrayBuffer or Uint8Array');
    }

    this.view = new DataView(this.buffer, this.baseOffset, this.length);
    this.cursor = 0;
  }

  tell() {
    return this.cursor;
  }

  seek(offset) {
    if (offset < 0 || offset > this.length) {
      throw new RangeError(`Offset ${offset} out of bounds [0, ${this.length}]`);
    }
    this.cursor = offset;
    return this;
  }

  skip(count) {
    return this.seek(this.cursor + count);
  }

  remaining() {
    return this.length - this.cursor;
  }

  readUint8() {
    if (this.cursor + 1 > this.length) throw new RangeError('Unexpected EOF reading Uint8');
    const val = this.view.getUint8(this.cursor);
    this.cursor += 1;
    return val;
  }

  readUint16(littleEndian = false) {
    if (this.cursor + 2 > this.length) throw new RangeError('Unexpected EOF reading Uint16');
    const val = this.view.getUint16(this.cursor, littleEndian);
    this.cursor += 2;
    return val;
  }

  readUint32(littleEndian = false) {
    if (this.cursor + 4 > this.length) throw new RangeError('Unexpected EOF reading Uint32');
    const val = this.view.getUint32(this.cursor, littleEndian);
    this.cursor += 4;
    return val;
  }

  /**
   * Read 40-bit unsigned integer (5 bytes)
   * PSARC format uses 40-bit values for file uncompressed sizes and data offsets.
   */
  readUint40(littleEndian = false) {
    if (this.cursor + 5 > this.length) throw new RangeError('Unexpected EOF reading Uint40');
    let val;
    if (littleEndian) {
      const low = this.view.getUint32(this.cursor, true);
      const high = this.view.getUint8(this.cursor + 4);
      val = (high * 0x100000000) + low;
    } else {
      const high = this.view.getUint8(this.cursor);
      const low = this.view.getUint32(this.cursor + 1, false);
      val = (high * 0x100000000) + low;
    }
    this.cursor += 5;
    return val;
  }

  readUint64(littleEndian = false) {
    if (this.cursor + 8 > this.length) throw new RangeError('Unexpected EOF reading Uint64');
    const val = this.view.getBigUint64(this.cursor, littleEndian);
    this.cursor += 8;
    return val;
  }

  readFourCC() {
    if (this.cursor + 4 > this.length) throw new RangeError('Unexpected EOF reading FourCC');
    let str = '';
    for (let i = 0; i < 4; i++) {
      str += String.fromCharCode(this.readUint8());
    }
    return str;
  }

  readString(length) {
    if (this.cursor + length > this.length) throw new RangeError('Unexpected EOF reading String');
    const bytes = new Uint8Array(this.buffer, this.baseOffset + this.cursor, length);
    this.cursor += length;
    return new TextDecoder('utf-8', { fatal: false }).decode(bytes);
  }

  readNullTermString(maxLength = 256) {
    const start = this.cursor;
    let len = 0;
    while (this.cursor < this.length && len < maxLength) {
      const byte = this.readUint8();
      if (byte === 0) break;
      len++;
    }
    const bytes = new Uint8Array(this.buffer, this.baseOffset + start, len);
    return new TextDecoder('utf-8', { fatal: false }).decode(bytes);
  }

  readBytes(length) {
    if (this.cursor + length > this.length) throw new RangeError('Unexpected EOF reading Bytes');
    const bytes = new Uint8Array(this.buffer, this.baseOffset + this.cursor, length);
    this.cursor += length;
    return bytes;
  }

  slice(offset, length) {
    if (offset + length > this.length) throw new RangeError('Slice extends beyond buffer boundary');
    return new Uint8Array(this.buffer, this.baseOffset + offset, length);
  }

  // --- Static Utility Methods ---

  static toHex(val, padding = 8) {
    if (val === undefined || val === null) return '0x' + '0'.repeat(padding);
    return '0x' + Number(val).toString(16).toUpperCase().padStart(padding, '0');
  }

  static toHex64(val) {
    if (typeof val === 'bigint') {
      return '0x' + val.toString(16).toUpperCase().padStart(16, '0');
    }
    return '0x' + Number(val).toString(16).toUpperCase().padStart(16, '0');
  }

  static formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const num = (bytes / Math.pow(k, i)).toFixed(i === 0 ? 0 : 2);
    return `${num} ${sizes[i]}`;
  }

  static toHexDump(uint8Array, startOffset = 0, length = 256) {
    const end = Math.min(startOffset + length, uint8Array.length);
    const rows = [];
    for (let i = startOffset; i < end; i += 16) {
      const chunkEnd = Math.min(i + 16, end);
      const hexPart = [];
      let asciiPart = '';
      for (let j = i; j < i + 16; j++) {
        if (j < chunkEnd) {
          const byte = uint8Array[j];
          hexPart.push(byte.toString(16).toUpperCase().padStart(2, '0'));
          asciiPart += (byte >= 32 && byte <= 126) ? String.fromCharCode(byte) : '.';
        } else {
          hexPart.push('  ');
          asciiPart += ' ';
        }
        if (j === i + 7) hexPart.push('');
      }
      const addr = '0x' + i.toString(16).toUpperCase().padStart(8, '0');
      rows.push({
        offset: i,
        address: addr,
        hex: hexPart.join(' '),
        ascii: asciiPart
      });
    }
    return rows;
  }
}
