def parse_pfs_xattr(record):
    return {'name': record[:16], 'val_len': len(record) - 16}
