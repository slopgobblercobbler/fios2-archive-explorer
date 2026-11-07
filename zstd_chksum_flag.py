def has_zstd_checksum(flag_byte):
    return bool(flag_byte & 0x04)
