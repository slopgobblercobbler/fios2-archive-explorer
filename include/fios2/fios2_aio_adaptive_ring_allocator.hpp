#pragma once
#include <cstddef>
#include <cstdint>

namespace fios2 {
struct Fios2AdaptiveRingAllocator {
    std::size_t bufferSize;
    std::size_t head{0};
    std::size_t tail{0};
    bool allocate(std::size_t bytes, std::size_t& outOffset) {
        if (bytes > bufferSize) return false;
        outOffset = head;
        head = (head + bytes) % bufferSize;
        return true;
    }
};
}
