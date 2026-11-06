#pragma once
#include <cstdint>

namespace fios2 {
struct VfsReadAheadTuner {
    static std::uint32_t computeWindow(std::uint32_t sequentialHitCount, std::uint32_t baseWindow = 65536) {
        if (sequentialHitCount > 8) return baseWindow * 4;
        if (sequentialHitCount > 3) return baseWindow * 2;
        return baseWindow;
    }
};
}
