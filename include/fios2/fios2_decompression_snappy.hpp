#pragma once
#include <cstddef>
#include <cstdint>
#include <span>

namespace fios2 {
struct Fios2DecompressionSnappy {
    static bool verifyFramedIdentifier(std::span<const std::uint8_t> buffer) {
        if (buffer.size() < 10) return false;
        return buffer[0] == 0xFF && buffer[1] == 0x06 && buffer[2] == 0x00 && buffer[3] == 0x00 &&
               buffer[4] == 0x73 && buffer[5] == 0x4E && buffer[6] == 0x61 && buffer[7] == 0x50 &&
               buffer[8] == 0x70 && buffer[9] == 0x59;
    }
};
}
