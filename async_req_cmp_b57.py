def compare_req_priority(req_a, req_b):
    return req_b.get('prio', 0) - req_a.get('prio', 0)
