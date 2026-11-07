def is_pfs_directory(mode):
    return (mode & 0xF000) == 0x4000
