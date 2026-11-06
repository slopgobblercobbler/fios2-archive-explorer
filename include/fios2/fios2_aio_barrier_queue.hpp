#pragma once
#include <cstdint>
#include <deque>

namespace fios2 {
struct Fios2AioBarrierQueue {
    std::deque<std::uint64_t> activeRequests;
    bool barrierPending{false};
    void pushRequest(std::uint64_t reqId) { activeRequests.push_back(reqId); }
    void setBarrier() { barrierPending = true; }
    bool canProcessNext() const { return !barrierPending || activeRequests.empty(); }
};
}
