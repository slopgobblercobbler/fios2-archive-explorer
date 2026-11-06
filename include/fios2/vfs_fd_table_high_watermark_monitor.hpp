#pragma once
#include <algorithm>
#include <cstdint>

namespace fios2 {
struct VfsFdHighWatermark {
    std::uint32_t peakFd{0};
    void observeFd(std::uint32_t fd) {
        peakFd = std::max(peakFd, fd);
    }
};
}
