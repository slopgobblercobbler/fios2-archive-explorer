#pragma once
#include <cstddef>
#include <cstdint>
#include <span>

namespace fios2 {
struct Fios2DecompressionDeflate {
    static bool verifyZlibHeader(std::span<const std::uint8_t> buffer) {
        if (buffer.size() < 2) return false;
        std::uint16_t header = (static_cast<std::uint16_t>(buffer[0]) << 8) | buffer[1];
        return (header % 31) == 0;
    }
};
}
