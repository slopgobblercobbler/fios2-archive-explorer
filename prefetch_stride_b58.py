def compute_prefetch_stride(seq_reads, base_stride=4):
    return base_stride * (2 if seq_reads > 8 else 1)
