def report_inode_usage(used_inodes, max_inodes):
    return (used_inodes / max(max_inodes, 1)) * 100.0
