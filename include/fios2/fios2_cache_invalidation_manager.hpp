#pragma once
#include <cstdint>
#include <unordered_set>

namespace fios2 {
struct Fios2CacheInvalidationManager {
    std::unordered_set<std::uint64_t> invalidatedBlocks;
    void invalidate(std::uint64_t blockId) { invalidatedBlocks.insert(blockId); }
    bool isInvalidated(std::uint64_t blockId) const { return invalidatedBlocks.contains(blockId); }
};
}
