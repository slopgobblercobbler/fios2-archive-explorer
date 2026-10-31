/**
 * Sample Binary Generators for FIOS2 Archive Explorer
 * Constructs authentic PSARC archives, PFS filesystems, and multi-layer overlay configurations.
 */

/**
 * Helper to encode text to UTF-8 Uint8Array
 */
function encodeUtf8(str) {
  return new TextEncoder().encode(str);
}

/**
 * Sample 1: PS5 Game Title Update (PSARC container with RAD Oodle compression)
 */
export function createSample1PsarcOodle() {
  const blockSize = 65536; // 64KB
  const manifestFiles = [
    '/app0/eboot.bin',
    '/app0/media/shaders.sb',
    '/app0/data/audio/bgm.vag'
  ];
  const manifestString = manifestFiles.join('\n') + '\n';
  const manifestBytes = encodeUtf8(manifestString);

  // File 1: eboot.bin - 131,072 bytes (2 chunks)
  // File 2: shaders.sb - 45,000 bytes (1 chunk)
  // File 3: bgm.vag - 65,536 bytes (1 chunk)
  const files = [
    {
      name: '/manifest',
      uncompressedSize: manifestBytes.length,
      chunks: [manifestBytes.length] // Manifest uncompressed
    },
    {
      name: '/app0/eboot.bin',
      uncompressedSize: 131072,
      chunks: [38240, 41120] // 2 compressed chunks with Oodle Kraken
    },
    {
      name: '/app0/media/shaders.sb',
      uncompressedSize: 45000,
      chunks: [14200] // 1 compressed chunk
    },
    {
      name: '/app0/data/audio/bgm.vag',
      uncompressedSize: 65536,
      chunks: [48190] // 1 compressed chunk
    }
  ];

  const tocEntrySize = 30;
  const tocEntriesCount = files.length;
  const tocOffset = 32;
  const tocTotalBytes = tocEntriesCount * tocEntrySize;

  // Total chunks = 1 (manifest) + 2 (eboot) + 1 (shaders) + 1 (bgm) = 5 chunks
  const allChunks = [];
  files.forEach(f => f.chunks.forEach(c => allChunks.push(c)));

  const chunkTableOffset = tocOffset + tocTotalBytes;
  const chunkTableBytes = allChunks.length * 2;
  const dataStartOffset = Math.ceil((chunkTableOffset + chunkTableBytes) / 16) * 16;

  // Calculate file offsets
  let currentDataOffset = dataStartOffset;
  const fileDataOffsets = [];
  const fileTotalCompressedSizes = [];

  for (const f of files) {
    fileDataOffsets.push(currentDataOffset);
    const compSize = f.chunks.reduce((a, b) => a + b, 0);
    fileTotalCompressedSizes.push(compSize);
    currentDataOffset += compSize;
  }

  const totalArchiveSize = currentDataOffset;
  const buffer = new Uint8Array(totalArchiveSize);
  const view = new DataView(buffer.buffer);

  // 1. Header (32 bytes Big Endian)
  buffer.set(encodeUtf8('PSAR'), 0); // Magic
  view.setUint16(4, 1, false);        // Major Version 1
  view.setUint16(6, 4, false);        // Minor Version 4
  buffer.set(encodeUtf8('oodl'), 8); // FourCC Oodle
  view.setUint32(12, tocOffset, false);
  view.setUint32(16, tocEntrySize, false);
  view.setUint32(20, tocEntriesCount, false);
  view.setUint32(24, blockSize, false);
  view.setUint32(28, 0x00000001, false); // Archive flags (relative paths)

  // 2. TOC Entries
  let currentBlockIndex = 0;
  for (let i = 0; i < files.length; i++) {
    const f = files[i];
    const entryStart = tocOffset + (i * tocEntrySize);

    // Mock MD5 hash (16 bytes)
    for (let h = 0; h < 16; h++) {
      buffer[entryStart + h] = ((i + 1) * 37 + h * 17) & 0xFF;
    }

    // Block index (4 bytes)
    view.setUint32(entryStart + 16, currentBlockIndex, false);

    // Uncompressed size (40-bit uint: 5 bytes Big Endian)
    const uSize = f.uncompressedSize;
    const uHigh = Math.floor(uSize / 0x100000000);
    const uLow = uSize >>> 0;
    buffer[entryStart + 20] = uHigh;
    view.setUint32(entryStart + 21, uLow, false);

    // Data offset (40-bit uint: 5 bytes Big Endian)
    const dOffset = fileDataOffsets[i];
    const dHigh = Math.floor(dOffset / 0x100000000);
    const dLow = dOffset >>> 0;
    buffer[entryStart + 25] = dHigh;
    view.setUint32(entryStart + 26, dLow, false);

    currentBlockIndex += f.chunks.length;
  }

  // 3. Chunk Table (16-bit uints Big Endian)
  let cCursor = chunkTableOffset;
  for (const cSize of allChunks) {
    view.setUint16(cCursor, cSize, false);
    cCursor += 2;
  }

  // 4. Manifest Data
  buffer.set(manifestBytes, fileDataOffsets[0]);

  // 5. Fill dummy file payloads with recognizable test patterns
  for (let i = 1; i < files.length; i++) {
    const offset = fileDataOffsets[i];
    const len = fileTotalCompressedSizes[i];
    for (let b = 0; b < len; b++) {
      buffer[offset + b] = (0x50 + (i * 0x10) + (b % 16)) & 0xFF;
    }
  }

  return buffer;
}

/**
 * Sample 2: PS5 PFS (PlayStation File System) Encrypted Container Image
 */
export function createSample2PfsContainer() {
  const blockSize = 4096;
  const blockCount = 16;
  const totalBytes = blockSize * blockCount;
  const buffer = new Uint8Array(totalBytes);
  const view = new DataView(buffer.buffer);

  // PFS Superblock at Block 0 (Little Endian)
  view.setUint32(0, 0x20150527, true); // Magic PFS v2
  view.setUint32(4, 2, true);          // Version 2
  view.setUint32(8, 0x07, true);       // Mode: ReadOnly | Encrypted | Signed
  view.setUint32(12, blockSize, true); // Block size 4096
  view.setBigUint64(16, BigInt(blockCount), true); // Block count
  view.setUint32(24, 1, true);         // Inode block count (1 block for inodes)
  view.setUint32(28, 4, true);         // Inode count (4 inodes)
  view.setUint32(32, 1, true);         // Root inode index
  view.setUint32(36, 128, true);       // Inode size (128 bytes)

  const titleIdBytes = encodeUtf8('PPSA01942-GAME00');
  buffer.set(titleIdBytes, 40);

  view.setBigUint64(56, BigInt(totalBytes - 512), true); // ICV offset
  view.setUint32(64, 512, true);                         // ICV size

  // Inode Table at Block 1 (offset 4096)
  const inodeTableOffset = blockSize;

  // Inode 1: Root Directory /
  const ino1Offset = inodeTableOffset + 0;
  view.setUint32(ino1Offset + 0, 1, true);      // Inode #1
  view.setUint16(ino1Offset + 4, 0o040755, true); // Mode: Dir, 0755
  view.setUint16(ino1Offset + 6, 0, true);
  view.setUint32(ino1Offset + 8, 1000, true);   // UID
  view.setUint32(ino1Offset + 12, 1000, true);  // GID
  view.setBigUint64(ino1Offset + 16, 4096n, true); // Dir size
  view.setUint32(ino1Offset + 24, 1, true);     // Blocks allocated
  view.setUint32(ino1Offset + 28, 2, true);     // Direct block 0 -> block #2 (offset 8192)

  // Inode 2: Directory /sce_sys
  const ino2Offset = inodeTableOffset + 128;
  view.setUint32(ino2Offset + 0, 2, true);      // Inode #2
  view.setUint16(ino2Offset + 4, 0o040755, true); // Mode: Dir, 0755
  view.setBigUint64(ino2Offset + 16, 4096n, true);
  view.setUint32(ino2Offset + 28, 3, true);     // Direct block 0 -> block #3 (offset 12288)

  // Inode 3: File /sce_sys/param.json
  const ino3Offset = inodeTableOffset + 256;
  view.setUint32(ino3Offset + 0, 3, true);      // Inode #3
  view.setUint16(ino3Offset + 4, 0o100644, true); // Mode: File, 0644
  view.setBigUint64(ino3Offset + 16, 1280n, true); // File size
  view.setUint32(ino3Offset + 28, 4, true);     // Direct block 0 -> block #4 (offset 16384)

  // Inode 4: File /app0/eboot.bin
  const ino4Offset = inodeTableOffset + 384;
  view.setUint32(ino4Offset + 4, 4, true);      // Inode #4
  view.setUint16(ino4Offset + 4, 0o100755, true); // Mode: File, 0755
  view.setBigUint64(ino4Offset + 16, 32768n, true);
  view.setUint32(ino4Offset + 28, 5, true);     // Direct block 0 -> block #5

  // Dirents in Root Directory Block 2 (offset 8192)
  const rootBlockOffset = 2 * blockSize;
  let dCursor = rootBlockOffset;

  // Dirent 1: sce_sys (dir) -> Inode 2
  view.setUint32(dCursor + 0, 2, true); // Inode 2
  view.setUint16(dCursor + 4, 24, true); // Record len
  buffer[dCursor + 6] = 2;              // File type: DIR
  buffer[dCursor + 7] = 7;              // Name len
  buffer.set(encodeUtf8('sce_sys'), dCursor + 8);
  dCursor += 24;

  // Dirent 2: eboot.bin (file) -> Inode 4
  view.setUint32(dCursor + 0, 4, true); // Inode 4
  view.setUint16(dCursor + 4, 24, true);
  buffer[dCursor + 6] = 1;              // File type: REG
  buffer[dCursor + 7] = 9;              // Name len
  buffer.set(encodeUtf8('eboot.bin'), dCursor + 8);

  // Dirents in sce_sys Directory Block 3 (offset 12288)
  const sysBlockOffset = 3 * blockSize;
  view.setUint32(sysBlockOffset + 0, 3, true); // Inode 3
  view.setUint16(sysBlockOffset + 4, 24, true);
  buffer[sysBlockOffset + 6] = 1;              // File type: REG
  buffer[sysBlockOffset + 7] = 10;
  buffer.set(encodeUtf8('param.json'), sysBlockOffset + 8);

  return buffer;
}

/**
 * Sample 3: Multi-Layer Overlay Mount Configuration Preset
 */
export function createSample3OverlayConfig() {
  return [
    {
      name: 'Layer 0: Base Disc PFS Image (v1.00)',
      mountPoint: '/app0',
      order: 0,
      files: [
        { path: '/app0/eboot.bin', uncompressedSize: 52428800, compression: 'none', note: 'Base executable v1.00' },
        { path: '/app0/media/level1.pak', uncompressedSize: 125829120, compression: 'oodl', note: 'Base assets' },
        { path: '/app0/media/common.pak', uncompressedSize: 41943040, compression: 'oodl', note: 'Shared textures' },
        { path: '/app0/sce_sys/param.json', uncompressedSize: 2048, compression: 'none', note: 'Title metadata' }
      ]
    },
    {
      name: 'Layer 1: Day-One Title Update Patch (v1.05)',
      mountPoint: '/app0',
      order: 100,
      files: [
        { path: '/app0/eboot.bin', uncompressedSize: 54525952, compression: 'none', note: 'Patched hotfix executable v1.05 (Overrides Layer 0)' },
        { path: '/app0/media/level1.pak', uncompressedSize: 128450560, compression: 'oodl', note: 'Patched level data (Overrides Layer 0)' },
        { path: '/app0/patch_notes.txt', uncompressedSize: 4096, compression: 'none', note: 'Update notes' }
      ]
    },
    {
      name: 'Layer 2: DLC Expansion Pack 1',
      mountPoint: '/app0/dlc',
      order: 200,
      files: [
        { path: '/app0/dlc/expansion1.pak', uncompressedSize: 67108864, compression: 'oodl', note: 'Expansion campaign' },
        { path: '/app0/dlc/bonus_outfit.dat', uncompressedSize: 16777216, compression: 'oodl', note: 'Exclusive skin pack' }
      ]
    }
  ];
}

/**
 * Sample 4: Corrupted FIOS2 Archive (Auditor Negative Verification)
 */
export function createSample4CorruptedArchive() {
  const buffer = new Uint8Array(256);
  const view = new DataView(buffer.buffer);

  // Corrupted magic: 'BAD!'
  buffer.set(encodeUtf8('BAD!'), 0);
  view.setUint16(4, 9, false); // Unsupported Major Version
  view.setUint16(6, 9, false);
  buffer.set(encodeUtf8('XXXX'), 8); // Invalid FourCC compression

  // Out-of-bounds TOC Offset pointing past EOF (0x8000)
  view.setUint32(12, 0x00008000, false);
  view.setUint32(16, 30, false);
  view.setUint32(20, 5, false);
  view.setUint32(24, 65536, false);

  // Inject a path traversal string
  const traversalStr = '../../etc/shadow\0';
  buffer.set(encodeUtf8(traversalStr), 40);

  return buffer;
}
