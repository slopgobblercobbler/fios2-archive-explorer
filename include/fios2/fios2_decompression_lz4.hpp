#pragma once
#include <cstddef>
#include <cstdint>
#include <span>

namespace fios2 {
struct Fios2DecompressionLz4 {
    static bool verifyFrameMagic(std::span<const std::uint8_t> buffer) {
        if (buffer.size() < 4) return false;
        return buffer[0] == 0x04 && buffer[1] == 0x22 && buffer[2] == 0x4D && buffer[3] == 0x18;
    }
};
}
