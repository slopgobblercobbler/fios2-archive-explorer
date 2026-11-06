def check_symlink_loop(visited, path, max_depth=16):
    return len(visited) > max_depth or path in visited
