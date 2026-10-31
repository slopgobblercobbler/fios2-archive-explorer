import { BinaryReader } from './binary_reader.js';
import {
  PSARC_MAGIC_STR,
  PSARC_MAGIC_BE,
  COMPRESSION_FOURCC,
  COMPRESSION_NAMES,
  DEFAULT_PSARC_BLOCK_SIZE
} from './fios2_constants.js';

/**
 * PSARC Archive Parser
 * Parses Sony PlayStation Archive (PSARC) container files used across PS3, PS4, and PS5 libSceFios2.
 */
export class PsarcParser {
  /**
   * @param {ArrayBuffer|Uint8Array} buffer
   */
  constructor(buffer) {
    this.reader = new BinaryReader(buffer);
    this.dataLength = this.reader.length;
    this.rawBytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  }

  /**
   * Parse PSARC container
   * @returns {Object} Parsed PSARC structure
   */
  parse() {
    this.reader.seek(0);

    // 1. Validate Header
    if (this.dataLength < 32) {
      throw new Error(`Invalid archive size: ${this.dataLength} bytes (minimum PSARC header is 32 bytes)`);
    }

    const magic = this.reader.readFourCC();
    if (magic !== PSARC_MAGIC_STR) {
      const hexMagic = BinaryReader.toHex(new DataView(this.rawBytes.buffer, this.rawBytes.byteOffset, 4).getUint32(0, false));
      throw new Error(`Invalid PSARC Magic Header: "${magic}" (${hexMagic}). Expected "${PSARC_MAGIC_STR}" (0x50534152)`);
    }

    const versionMajor = this.reader.readUint16(false);
    const versionMinor = this.reader.readUint16(false);
    const compression = this.reader.readFourCC();
    const tocOffset = this.reader.readUint32(false);
    const tocEntrySize = this.reader.readUint32(false);
    const tocEntriesCount = this.reader.readUint32(false);
    const blockSize = this.reader.readUint32(false) || DEFAULT_PSARC_BLOCK_SIZE;
    const archiveFlags = this.reader.readUint32(false);

    // Sanity checks on header boundaries
    if (tocOffset >= this.dataLength) {
      throw new Error(`TOC offset (0x${tocOffset.toString(16)}) exceeds archive size (0x${this.dataLength.toString(16)})`);
    }
    if (tocEntrySize < 30) {
      throw new Error(`Invalid TOC entry size: ${tocEntrySize} bytes (must be at least 30 bytes)`);
    }

    const header = {
      magic,
      version: `${versionMajor}.${versionMinor}`,
      versionMajor,
      versionMinor,
      compression,
      compressionName: COMPRESSION_NAMES[compression] || `Custom (${compression})`,
      tocOffset,
      tocEntrySize,
      tocEntriesCount,
      blockSize,
      archiveFlags,
      flagsDecoded: {
        relativePaths: Boolean(archiveFlags & 1),
        ignoreCase: Boolean(archiveFlags & 2),
        absolutePaths: Boolean(archiveFlags & 4)
      }
    };

    // 2. Parse TOC Entries
    this.reader.seek(tocOffset);
    const entries = [];
    const tocTotalBytes = tocEntriesCount * tocEntrySize;

    if (tocOffset + tocTotalBytes > this.dataLength) {
      throw new Error(`TOC table range (0x${(tocOffset + tocTotalBytes).toString(16)}) exceeds archive size`);
    }

    for (let i = 0; i < tocEntriesCount; i++) {
      const entryStart = tocOffset + (i * tocEntrySize);
      this.reader.seek(entryStart);

      const hashBytes = this.reader.readBytes(16);
      const hashHex = Array.from(hashBytes).map(b => b.toString(16).padStart(2, '0')).join('');
      const blockIndex = this.reader.readUint32(false);

      let uncompressedSize;
      let dataOffset;

      if (tocEntrySize === 30) {
        uncompressedSize = this.reader.readUint40(false);
        dataOffset = this.reader.readUint40(false);
      } else {
        // 32-byte or larger variant
        uncompressedSize = this.reader.readUint40(false);
        this.reader.seek(entryStart + 25);
        dataOffset = this.reader.readUint40(false);
      }

      entries.push({
        index: i,
        tocOffset: entryStart,
        hashHex,
        blockIndex,
        uncompressedSize,
        dataOffset,
        path: i === 0 ? '/manifest' : `entry_${i.toString().padStart(4, '0')}`,
        isManifest: i === 0
      });
    }

    // 3. Parse Chunk Table
    const chunkTableOffset = tocOffset + tocTotalBytes;
    let chunkTable = [];
    if (entries.length > 0) {
      const firstDataOffset = entries.reduce((min, e) => (e.dataOffset > 0 && e.dataOffset < min ? e.dataOffset : min), this.dataLength);
      const chunkBytesLength = Math.max(0, firstDataOffset - chunkTableOffset);
      const chunkCount = Math.floor(chunkBytesLength / 2);

      this.reader.seek(chunkTableOffset);
      for (let c = 0; c < chunkCount; c++) {
        chunkTable.push(this.reader.readUint16(false));
      }
    }

    // 4. Resolve Manifest Names (Entry 0)
    let manifestText = '';
    let filePaths = [];
    if (entries.length > 0) {
      const manifestEntry = entries[0];
      if (manifestEntry.dataOffset < this.dataLength && manifestEntry.uncompressedSize > 0) {
        try {
          const availLen = Math.min(manifestEntry.uncompressedSize, this.dataLength - manifestEntry.dataOffset);
          const manifestBytes = this.rawBytes.subarray(manifestEntry.dataOffset, manifestEntry.dataOffset + availLen);
          manifestText = new TextDecoder('utf-8', { fatal: false }).decode(manifestBytes);
          filePaths = manifestText
            .split(/[\r\n\0]+/)
            .map(s => s.trim())
            .filter(s => s.length > 0);
        } catch {
          // Non-fatal if manifest is compressed or raw
        }
      }
    }

    // Map filenames to entries 1..N
    for (let i = 1; i < entries.length; i++) {
      if (filePaths[i - 1]) {
        entries[i].path = filePaths[i - 1];
        if (!entries[i].path.startsWith('/')) {
          entries[i].path = '/' + entries[i].path;
        }
      }
    }

    // 5. Calculate Chunk & Compression Details for each entry
    let totalUncompressed = 0;
    let totalCompressed = 0;

    for (const entry of entries) {
      const numBlocks = Math.ceil(entry.uncompressedSize / blockSize);
      const chunks = [];
      let entryCompressedSize = 0;

      for (let b = 0; b < numBlocks; b++) {
        const cIndex = entry.blockIndex + b;
        let cSize = chunkTable[cIndex];
        const isUncompressed = cSize === 0 || cSize === undefined;
        const actualChunkCompressed = isUncompressed ? Math.min(blockSize, entry.uncompressedSize - (b * blockSize)) : cSize;
        const actualChunkUncompressed = Math.min(blockSize, entry.uncompressedSize - (b * blockSize));

        chunks.push({
          chunkIndex: cIndex,
          blockOffset: entry.dataOffset + entryCompressedSize,
          compressedSize: actualChunkCompressed,
          uncompressedSize: actualChunkUncompressed,
          isCompressed: !isUncompressed
        });

        entryCompressedSize += actualChunkCompressed;
      }

      entry.chunks = chunks;
      entry.compressedSize = entryCompressedSize > 0 ? entryCompressedSize : entry.uncompressedSize;
      entry.compressionRatio = entry.uncompressedSize > 0
        ? Math.max(0, ((1 - (entry.compressedSize / entry.uncompressedSize)) * 100)).toFixed(1)
        : '0.0';
      entry.requiredBufferSize = Math.min(entry.uncompressedSize, blockSize);

      if (!entry.isManifest) {
        totalUncompressed += entry.uncompressedSize;
        totalCompressed += entry.compressedSize;
      }
    }

    const overallSavings = totalUncompressed > 0
      ? Math.max(0, ((1 - (totalCompressed / totalUncompressed)) * 100)).toFixed(1)
      : '0.0';

    return {
      type: 'PSARC',
      header,
      entries,
      chunkTable,
      manifestText,
      totalFiles: Math.max(0, entries.length - 1),
      totalUncompressedBytes: totalUncompressed,
      totalCompressedBytes: totalCompressed,
      overallSavingsPercent: overallSavings,
      archiveTotalBytes: this.dataLength
    };
  }
}
