def compute_cache_pressure(used, capacity):
    return used / max(capacity, 1)
