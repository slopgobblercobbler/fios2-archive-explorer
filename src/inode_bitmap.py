
def is_inode_allocated(bitmap: bytes, index: int) -> bool:
    return (bitmap[index // 8] & (1 << (index % 8))) != 0
