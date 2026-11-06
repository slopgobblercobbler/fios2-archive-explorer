#pragma once
#include <cstddef>
#include <cstdint>

namespace fios2 {
struct Fios2StreamingRingBuffer {
    std::size_t capacity;
    std::size_t readPos{0};
    std::size_t writePos{0};
    std::size_t availableBytes() const {
        return (writePos >= readPos) ? (writePos - readPos) : (capacity - (readPos - writePos));
    }
};
}
