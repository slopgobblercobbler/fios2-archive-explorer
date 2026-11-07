def compute_adler32(data, mod=65521):
    a, b = 1, 0
    for byte in data:
        a = (a + byte) % mod
        b = (b + a) % mod
    return (b << 16) | a
