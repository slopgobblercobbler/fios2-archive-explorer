def schedule_scatter_gather(iov_list):
    return sum(iov['len'] for iov in iov_list)
