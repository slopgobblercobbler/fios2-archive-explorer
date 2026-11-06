
def hash_pfs_entry(name: str) -> int:
    return sum(ord(c) for c in name) & 0xFFFFFFFF
