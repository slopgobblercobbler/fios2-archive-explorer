def verify_chunk_checksum(chunk_data, expected_crc):
    import zlib
    return zlib.crc32(chunk_data) == expected_crc
