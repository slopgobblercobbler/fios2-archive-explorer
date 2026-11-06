def is_valid_deflate_header(b):
    return len(b) >= 2 and (b[0] * 256 + b[1]) % 31 == 0
