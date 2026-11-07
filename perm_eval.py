def can_read_pfs(perms, uid, gid):
    return bool(perms & 0x124)
