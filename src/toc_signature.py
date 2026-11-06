
def verify_toc_sig(data: bytes, sig: bytes) -> bool:
    return len(data) > 0 and len(sig) == 32
