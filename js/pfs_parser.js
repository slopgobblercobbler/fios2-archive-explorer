import { BinaryReader } from './binary_reader.js';
import {
  PFS_SUPERBLOCK_MAGIC_V1,
  PFS_SUPERBLOCK_MAGIC_V2,
  PFS_SUPERBLOCK_MAGIC_V3,
  PFS_SUPERBLOCK_MAGIC_STR,
  PFS_INODE_TYPE
} from './fios2_constants.js';

/**
 * PFS (PlayStation File System) Parser
 * Parses PS4 and PS5 PFS container images, superblocks, dinodes, dirents, and block extents.
 */
export class PfsParser {
  /**
   * @param {ArrayBuffer|Uint8Array} buffer
   */
  constructor(buffer) {
    this.reader = new BinaryReader(buffer);
    this.dataLength = this.reader.length;
    this.rawBytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  }

  /**
   * Check if buffer is a PFS image
   */
  static isPfs(buffer) {
    if (buffer.byteLength < 64) return false;
    const view = new DataView(buffer instanceof Uint8Array ? buffer.buffer : buffer, buffer instanceof Uint8Array ? buffer.byteOffset : 0, 64);
    // Check offset 0
    const m0_le = view.getUint32(0, true);
    const m0_be = view.getUint32(0, false);
    if (m0_le === PFS_SUPERBLOCK_MAGIC_V1 || m0_le === PFS_SUPERBLOCK_MAGIC_V2 || m0_le === PFS_SUPERBLOCK_MAGIC_V3) return true;
    if (m0_be === PFS_SUPERBLOCK_MAGIC_V1 || m0_be === PFS_SUPERBLOCK_MAGIC_V2 || m0_be === PFS_SUPERBLOCK_MAGIC_V3) return true;
    if (m0_be === 0x50465300 || m0_le === 0x00534650) return true; // 'PFS\0'
    return false;
  }

  /**
   * Parse PFS container
   */
  parse() {
    this.reader.seek(0);

    if (this.dataLength < 64) {
      throw new Error(`Buffer too small for PFS superblock: ${this.dataLength} bytes (minimum 64 bytes)`);
    }

    // Try reading magic in Little-Endian first (typical for PFS x86-64), fallback to Big-Endian
    let magic = this.reader.readUint32(true);
    let isLittleEndian = true;

    const validMagics = [PFS_SUPERBLOCK_MAGIC_V1, PFS_SUPERBLOCK_MAGIC_V2, PFS_SUPERBLOCK_MAGIC_V3];
    if (!validMagics.includes(magic) && magic !== 0x00534650) {
      this.reader.seek(0);
      magic = this.reader.readUint32(false);
      isLittleEndian = false;
      if (!validMagics.includes(magic) && magic !== 0x50465300) {
        throw new Error(`Invalid PFS Superblock Magic: ${BinaryReader.toHex(magic)}. Expected 0x20150527 or 'PFS\\0'`);
      }
    }

    const version = this.reader.readUint32(isLittleEndian);
    const mode = this.reader.readUint32(isLittleEndian);
    const blockSize = this.reader.readUint32(isLittleEndian) || 4096;
    const blockCount = Number(this.reader.readUint64(isLittleEndian));
    const inodeBlockCount = this.reader.readUint32(isLittleEndian);
    const inodeCount = this.reader.readUint32(isLittleEndian);
    const rootInodeIndex = this.reader.readUint32(isLittleEndian) || 1;
    const inodeSize = this.reader.readUint32(isLittleEndian) || 128;
    const titleIdRaw = this.reader.readString(16).replace(/\0/g, '').trim();
    const titleId = titleIdRaw.length > 0 ? titleIdRaw : 'PPSA-UNSPECIFIED';
    const icvOffset = Number(this.reader.readUint64(isLittleEndian));
    const icvSize = this.reader.readUint32(isLittleEndian);

    const superblock = {
      magic: BinaryReader.toHex(magic),
      magicDecimal: magic,
      version,
      mode,
      modeDecoded: {
        readOnly: Boolean(mode & 0x01),
        encrypted: Boolean(mode & 0x02),
        signedIcv: Boolean(mode & 0x04)
      },
      blockSize,
      blockCount,
      inodeBlockCount,
      inodeCount,
      rootInodeIndex,
      inodeSize,
      titleId,
      icvOffset,
      icvSize,
      isLittleEndian
    };

    // Parse Inodes Table
    const inodeTableOffset = blockSize; // Inodes usually follow Superblock in block 1
    const inodes = [];

    if (inodeTableOffset < this.dataLength && inodeCount > 0) {
      const availInodes = Math.min(inodeCount, Math.floor((this.dataLength - inodeTableOffset) / inodeSize));

      for (let i = 0; i < availInodes; i++) {
        const offset = inodeTableOffset + (i * inodeSize);
        this.reader.seek(offset);

        const inodeNum = this.reader.readUint32(isLittleEndian);
        const modeRaw = this.reader.readUint16(isLittleEndian);
        const flags = this.reader.readUint16(isLittleEndian);
        const uid = this.reader.readUint32(isLittleEndian);
        const gid = this.reader.readUint32(isLittleEndian);
        const fileSize = Number(this.reader.readUint64(isLittleEndian));
        const blocksAllocated = this.reader.readUint32(isLittleEndian);

        // Direct block extents (up to 8 direct blocks)
        const directBlocks = [];
        for (let b = 0; b < 8; b++) {
          directBlocks.push(this.reader.readUint32(isLittleEndian));
        }

        const mtime = Number(this.reader.readUint64(isLittleEndian));
        const isDir = Boolean((modeRaw & 0x0040) || (modeRaw & 0o040000));
        const isFile = Boolean((modeRaw & 0x0020) || (modeRaw & 0o100000));
        const isSymlink = Boolean(modeRaw & 0x0080);

        inodes.push({
          inodeIndex: i,
          inodeNum: inodeNum || i,
          modeRaw: BinaryReader.toHex(modeRaw, 4),
          isDir,
          isFile: !isDir,
          isSymlink,
          flags,
          uid,
          gid,
          fileSize,
          blocksAllocated,
          directBlocks: directBlocks.filter(b => b > 0),
          mtime: mtime > 0 ? new Date(mtime * 1000).toISOString() : new Date().toISOString(),
          offset
        });
      }
    }

    // Parse Dirents from data blocks
    const dirents = [];
    const dirMap = new Map();

    for (const inode of inodes) {
      if (inode.isDir && inode.directBlocks.length > 0) {
        for (const blockNum of inode.directBlocks) {
          const blockOffset = blockNum * blockSize;
          if (blockOffset + 64 <= this.dataLength) {
            this.reader.seek(blockOffset);
            let blockCursor = 0;

            while (blockCursor < blockSize && this.reader.tell() + 8 <= this.dataLength) {
              const targetInode = this.reader.readUint32(isLittleEndian);
              const recLen = this.reader.readUint16(isLittleEndian);
              const fileType = this.reader.readUint8();
              const nameLen = this.reader.readUint8();

              if (recLen === 0 || nameLen === 0) break;
              if (this.reader.tell() + nameLen > this.dataLength) break;

              const name = this.reader.readString(nameLen);
              dirents.push({
                parentInode: inode.inodeNum,
                targetInode,
                fileType,
                name,
                isDir: fileType === 2
              });

              blockCursor += recLen;
              // Align or skip to recLen
              const currentOffset = this.reader.tell() - blockOffset;
              if (blockCursor > currentOffset && blockOffset + blockCursor <= this.dataLength) {
                this.reader.seek(blockOffset + blockCursor);
              }
            }
          }
        }
      }
    }

    // Reconstruct file tree
    const fileEntries = [];
    if (dirents.length > 0) {
      for (const d of dirents) {
        if (d.name === '.' || d.name === '..') continue;
        const target = inodes.find(i => i.inodeNum === d.targetInode);
        fileEntries.push({
          path: `/${d.name}`,
          name: d.name,
          isDir: d.isDir,
          size: target ? target.fileSize : 0,
          inodeIndex: d.targetInode,
          mtime: target ? target.mtime : ''
        });
      }
    } else {
      // Synthesize entries from valid inodes
      for (const inode of inodes) {
        if (inode.inodeNum === rootInodeIndex) continue;
        fileEntries.push({
          path: `/file_ino_${inode.inodeNum}`,
          name: `file_ino_${inode.inodeNum}`,
          isDir: inode.isDir,
          size: inode.fileSize,
          inodeIndex: inode.inodeNum,
          mtime: inode.mtime
        });
      }
    }

    return {
      type: 'PFS',
      superblock,
      inodes,
      dirents,
      fileEntries,
      totalFiles: fileEntries.filter(f => !f.isDir).length,
      totalBytes: this.dataLength
    };
  }
}
