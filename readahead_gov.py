def expand_readahead(sequential_count, current_window=4, max_window=32):
    return min(max_window, current_window * 2) if sequential_count > 3 else current_window
