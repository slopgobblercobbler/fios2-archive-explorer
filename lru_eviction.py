def track_lru_eviction(cache, key):
    cache.pop(key, None)
    cache[key] = True
