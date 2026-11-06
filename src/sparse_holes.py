
def count_sparse_holes(extents: list[tuple[int, int]]) -> int:
    return len([e for e in extents if e[1] == 0])
