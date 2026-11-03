export interface Fios2ArchiveHeader {
    magic: string;
    version: number;
    totalFiles: number;
    inodeTableOffset: bigint;
    dataOffset: bigint;
}

export interface Fios2FileEntry {
    path: string;
    size: bigint;
    compressedSize: bigint;
    compressionType: number;
    offset: bigint;
}
