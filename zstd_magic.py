def is_zstd_magic(b):
    return len(b) >= 4 and b[:4] == b'\x28\xb5\x2f\xfd'
