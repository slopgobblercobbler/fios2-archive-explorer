#pragma once
#include <cstdint>
#include <vector>

namespace fios2 {
struct BTreeNodeCompactionOptimizer {
    static std::uint32_t compact(std::vector<std::uint64_t>& keys, std::uint64_t deletedSentinel = 0xFFFFFFFFFFFFFFFFULL) {
        auto it = std::remove(keys.begin(), keys.end(), deletedSentinel);
        std::uint32_t removed = static_cast<std::uint32_t>(std::distance(it, keys.end()));
        keys.erase(it, keys.end());
        return removed;
    }
};
}
