
def validate_symlink(target: str) -> bool:
    return not target.startswith('/') and '..' not in target
