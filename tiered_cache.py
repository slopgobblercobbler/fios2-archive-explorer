def allocate_cache_tier(size_mb, tier='L1'):
    return {'tier': tier, 'allocated_mb': size_mb}
