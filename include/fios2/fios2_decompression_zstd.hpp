#pragma once
#include <cstddef>
#include <cstdint>
#include <span>

namespace fios2 {
struct Fios2DecompressionZstd {
    static bool verifyMagic(std::span<const std::uint8_t> buffer) {
        if (buffer.size() < 4) return false;
        return buffer[0] == 0x28 && buffer[1] == 0xB5 && buffer[2] == 0x2F && buffer[3] == 0xFD;
    }
};
}
