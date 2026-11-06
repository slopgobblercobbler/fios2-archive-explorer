def validate_pfs_super_v2(magic, ver):
    return magic == b'PFS ' and ver == 2
