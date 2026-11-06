#pragma once
#include <cstdint>

namespace fios2 {
struct BTreeTraversalStack {
    static constexpr std::uint32_t MAX_DEPTH = 32;
    std::uint64_t nodeIndices[MAX_DEPTH];
    std::uint32_t currentDepth{0};
    bool push(std::uint64_t nodeIdx) {
        if (currentDepth >= MAX_DEPTH) return false;
        nodeIndices[currentDepth++] = nodeIdx;
        return true;
    }
    bool pop(std::uint64_t& outNodeIdx) {
        if (currentDepth == 0) return false;
        outNodeIdx = nodeIndices[--currentDepth];
        return true;
    }
};
}
