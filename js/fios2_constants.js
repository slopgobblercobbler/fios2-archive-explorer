/**
 * FIOS2 and PlayStation File System (PFS) Constants & Specifications
 * Reference: libSceFios2, AnyPS5 POSIX overlay architecture, PS4/PS5 PFS specifications.
 */

export const PSARC_MAGIC_STR = 'PSAR';
export const PSARC_MAGIC_BE = 0x50534152;

// PFS Superblock Magics
export const PFS_SUPERBLOCK_MAGIC_V1 = 0x20130315;
export const PFS_SUPERBLOCK_MAGIC_V2 = 0x20150527;
export const PFS_SUPERBLOCK_MAGIC_V3 = 0x20170822;
export const PFS_SUPERBLOCK_MAGIC_STR = 'PFS\0';

// Compression FourCCs
export const COMPRESSION_FOURCC = {
  ZLIB: 'zlib', // 0x7a6c6962 Deflate
  LZMA: 'lzma', // 0x6c7a6d61 LZMA
  LZ4:  'lz4 ', // 0x6c7a3420 LZ4
  OODL: 'oodl', // 0x6f6f646c RAD Game Tools Oodle (Kraken/Mermaid/Selkie)
  NONE: 'none', // Uncompressed
  ZERO: '\0\0\0\0'
};

export const COMPRESSION_NAMES = {
  'zlib': 'ZLIB (Deflate)',
  'lzma': 'LZMA High Compression',
  'lz4 ': 'LZ4 High Speed Stream',
  'oodl': 'RAD Oodle (Kraken / Selkie)',
  'none': 'Uncompressed (RAW)',
  '\0\0\0\0': 'Uncompressed (RAW)'
};

// libSceFios2 Error Codes (FreeBSD kernel / libkernel / libSceFios2 standard)
export const SCE_FIOS_ERRORS = {
  0x00000000: { name: 'SCE_FIOS_OK', description: 'Operation completed successfully.' },
  0x80540001: { name: 'SCE_FIOS_ERROR_INVALID_ARGUMENT', description: 'Invalid argument or null pointer parameter provided.' },
  0x80540002: { name: 'SCE_FIOS_ERROR_FILE_NOT_FOUND', description: 'Target file or directory path does not exist in mounted overlay.' },
  0x8054000e: { name: 'SCE_FIOS_ERROR_NOT_MOUNTED', description: 'Requested filesystem overlay mount point is not registered.' },
  0x80540010: { name: 'SCE_FIOS_ERROR_BUFFER_TOO_SMALL', description: 'Destination decompressor buffer allocation is smaller than uncompressed chunk.' },
  0x8054001f: { name: 'SCE_FIOS_ERROR_PATH_TRAVERSAL', description: 'Security fault: relative path traversal attempt (../) rejected.' },
  0x80540025: { name: 'SCE_FIOS_ERROR_CORRUPT_ARCHIVE', description: 'Archive header, TOC offset, or block table failed integrity audit.' },
  0x80540030: { name: 'SCE_FIOS_ERROR_DECOMPRESS_FAILED', description: 'Block decompression failed due to invalid chunk stream.' },
  0x80540035: { name: 'SCE_FIOS_ERROR_OUT_OF_BOUNDS', description: 'Read or seek operation exceeded archive chunk boundary.' }
};

// Default Mount Priority Orders in libSceFios2
export const FIOS2_MOUNT_ORDERS = {
  BASE_DISC: 0,       // /app0 Base Application PFS Image
  DAY_ONE_PATCH: 100, // /patch0 or /app0 Title Update Overlay
  DLC_EXPANSION: 200, // /app0/dlc or /addcont0
  DEV_HOSTAPP: 500    // /hostapp Development Host Bridge
};

// PFS Inode Modes & Types
export const PFS_INODE_TYPE = {
  FIFO: 0x0010,
  FILE: 0x0020,
  DIR:  0x0040,
  LNK:  0x0080
};

export const PFS_MODE_PERMISSIONS = {
  DIR_DEFAULT: 0o755,
  FILE_DEFAULT: 0o644,
  EXEC_DEFAULT: 0o755
};

export const DEFAULT_PSARC_BLOCK_SIZE = 65536; // 64 KB per chunk
