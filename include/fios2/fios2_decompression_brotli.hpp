#pragma once
#include <cstddef>
#include <cstdint>
#include <span>

namespace fios2 {
struct Fios2DecompressionBrotli {
    static bool verifyHeader(std::span<const std::uint8_t> buffer) {
        if (buffer.size() < 1) return false;
        return (buffer[0] & 0x03) != 0x03;
    }
};
}
