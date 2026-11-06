#pragma once
#include <cstdint>

namespace fios2 {
struct BTreeSplitBalancer {
    static float computeImbalanceRatio(std::uint32_t leftCount, std::uint32_t rightCount) {
        if (leftCount == 0 || rightCount == 0) return 1.0f;
        float maxC = static_cast<float>(std::max(leftCount, rightCount));
        float minC = static_cast<float>(std::min(leftCount, rightCount));
        return maxC / minC;
    }
};
}
