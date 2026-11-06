#pragma once
#include <cstdint>
#include <queue>
#include <vector>

namespace fios2 {
struct PrioritizedAioRequest {
    std::uint64_t reqId;
    std::uint32_t priority;
    bool operator<(const PrioritizedAioRequest& other) const {
        return priority < other.priority;
    }
};

struct Fios2AioPriorityScheduler {
    std::priority_queue<PrioritizedAioRequest> queue;
    void push(std::uint64_t id, std::uint32_t prio) { queue.push({id, prio}); }
    bool popNext(std::uint64_t& outId) {
        if (queue.empty()) return false;
        outId = queue.top().reqId;
        queue.pop();
        return true;
    }
};
}
