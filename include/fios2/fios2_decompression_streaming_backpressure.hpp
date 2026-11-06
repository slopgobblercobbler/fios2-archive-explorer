#pragma once
#include <cstdint>

namespace fios2 {
struct Fios2DecompressionBackpressure {
    static bool shouldThrottle(std::size_t pendingOutputBytes, std::size_t maxBufferLimit = 16 * 1024 * 1024) {
        return pendingOutputBytes >= maxBufferLimit;
    }
};
}
