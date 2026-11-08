def update_lfu_frequency(freq_table, block_id):
    freq_table[block_id] = freq_table.get(block_id, 0) + 1
    return freq_table[block_id]
