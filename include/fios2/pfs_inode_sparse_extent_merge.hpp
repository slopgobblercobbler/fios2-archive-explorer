#pragma once
#include <cstdint>

namespace fios2 {
struct PfsExtentMerger {
    static bool canMerge(std::uint64_t pBlock1, std::uint32_t count1, std::uint64_t pBlock2) {
        return (pBlock1 + count1) == pBlock2;
    }
};
}
