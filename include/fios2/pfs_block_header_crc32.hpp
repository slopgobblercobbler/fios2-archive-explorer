#pragma once
#include <cstdint>
#include <cstddef>

namespace fios2 {
struct PfsBlockHeaderCrc32 {
    static constexpr std::uint32_t calculate(const std::uint8_t* data, std::size_t len) noexcept {
        std::uint32_t crc = 0xFFFFFFFF;
        for (std::size_t i = 0; i < len; ++i) {
            crc ^= data[i];
            for (int k = 0; k < 8; ++k) {
                crc = (crc >> 1) ^ (0xEDB88320 & (-(crc & 1)));
            }
        }
        return ~crc;
    }
};
}
