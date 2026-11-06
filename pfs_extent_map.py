def parse_extent_map(block_data):
    return [{'start': int.from_bytes(block_data[i:i+4], 'little'), 'blocks': int.from_bytes(block_data[i+4:i+8], 'little')} for i in range(0, len(block_data), 8)]
