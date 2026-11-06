#pragma once
#include <algorithm>
#include <cstdint>

namespace fios2 {
struct VfsIoSaturationBackoff {
    static std::uint32_t calculateDelayMs(std::uint32_t queueDepth, std::uint32_t highWatermark = 64) {
        if (queueDepth <= highWatermark) return 0;
        std::uint32_t excess = queueDepth - highWatermark;
        return std::min(excess * 2, 50u);
    }
};
}
