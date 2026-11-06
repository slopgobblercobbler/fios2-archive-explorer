#pragma once
#include <algorithm>
#include <cstdint>
#include <vector>

namespace fios2 {
struct ReadRequest {
    std::uint64_t offset;
    std::uint32_t size;
};

struct Fios2ReadCoalescingScheduler {
    static bool canCoalesce(const ReadRequest& a, const ReadRequest& b, std::uint32_t maxGap = 4096) {
        if (a.offset + a.size > b.offset) return false;
        return (b.offset - (a.offset + a.size)) <= maxGap;
    }
};
}
