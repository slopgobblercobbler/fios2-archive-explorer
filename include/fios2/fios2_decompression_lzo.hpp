#pragma once
#include <cstddef>
#include <cstdint>
#include <span>

namespace fios2 {
struct Fios2DecompressionLzo {
    static bool verifyHeader(std::span<const std::uint8_t> buffer) {
        if (buffer.size() < 4) return false;
        return buffer[0] == 0xF0 && buffer[1] == 0x07 && buffer[2] == 0x4C && buffer[3] == 0x5A;
    }
};
}
