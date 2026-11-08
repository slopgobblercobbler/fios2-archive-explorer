def sample_dict_blocks(data, sample_size=4096):
    return [data[i:i+sample_size] for i in range(0, len(data), sample_size * 2)]
