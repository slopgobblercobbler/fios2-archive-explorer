def canonicalize_root(p):
    return '/' if p in ('', '/', '.') else '/' + p.strip('/')
