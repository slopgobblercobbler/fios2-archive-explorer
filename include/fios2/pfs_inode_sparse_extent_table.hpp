#pragma once
#include <cstdint>
#include <vector>

namespace fios2 {
struct PfsSparseExtent {
    std::uint64_t logicalBlock;
    std::uint64_t physicalBlock;
    std::uint32_t blockCount;
    bool isHole;
};

struct PfsSparseExtentTable {
    std::vector<PfsSparseExtent> extents;
    void addExtent(std::uint64_t lBlock, std::uint64_t pBlock, std::uint32_t count, bool hole) {
        extents.push_back({lBlock, pBlock, count, hole});
    }
};
}
