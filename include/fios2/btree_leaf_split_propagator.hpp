#pragma once
#include <cstdint>

namespace fios2 {
struct BTreeLeafSplitPropagator {
    static void computeMedianSplit(std::uint32_t totalKeys, std::uint32_t& leftCount, std::uint32_t& rightCount) {
        leftCount = totalKeys / 2;
        rightCount = totalKeys - leftCount;
    }
};
}
