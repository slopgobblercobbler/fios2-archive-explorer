def get_zstd_block_size(header_bytes):
    return (header_bytes[0] >> 3) | (header_bytes[1] << 5) | (header_bytes[2] << 13)
