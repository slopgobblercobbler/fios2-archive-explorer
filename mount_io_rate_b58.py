def measure_throughput_rate(bytes_xfer, duration_s):
    return bytes_xfer / max(duration_s, 0.001)
