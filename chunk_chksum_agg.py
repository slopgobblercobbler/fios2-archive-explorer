def aggregate_chunk_checksums(chunks):
    return sum(chunks) & 0xFFFFFFFF
