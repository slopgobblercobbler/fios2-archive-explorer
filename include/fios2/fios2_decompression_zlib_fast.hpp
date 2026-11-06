#pragma once
#include <cstddef>
#include <cstdint>
#include <span>

namespace fios2 {
struct Fios2FastChecksum {
    static std::uint32_t computeAdler32(std::span<const std::uint8_t> data) {
        std::uint32_t a = 1, b = 0;
        for (std::uint8_t byte : data) {
            a = (a + byte) % 65521;
            b = (b + a) % 65521;
        }
        return (b << 16) | a;
    }
};
}
