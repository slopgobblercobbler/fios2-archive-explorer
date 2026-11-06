def init_completion_ring(capacity=64):
    return {'capacity': capacity, 'head': 0, 'tail': 0, 'queue': [None]*capacity}
