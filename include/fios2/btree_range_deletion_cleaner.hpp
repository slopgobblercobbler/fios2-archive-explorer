#pragma once
#include <cstdint>
#include <vector>

namespace fios2 {
struct BTreeRangeDeletionCleaner {
    static std::uint32_t markDeletedRange(std::vector<std::uint64_t>& keys, std::uint64_t low, std::uint64_t high,
                                          std::uint64_t sentinel = 0xFFFFFFFFFFFFFFFFULL) {
        std::uint32_t count = 0;
        for (auto& k : keys) {
            if (k >= low && k <= high && k != sentinel) {
                k = sentinel;
                count++;
            }
        }
        return count;
    }
};
}
