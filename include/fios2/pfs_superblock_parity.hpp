#pragma once
#include <cstdint>
#include <cstddef>

namespace fios2 {
struct PfsSuperblockParity {
    static constexpr std::uint64_t compute_parity(const std::uint64_t* data, std::size_t qwords) noexcept {
        std::uint64_t parity = 0;
        for (std::size_t i = 0; i < qwords; ++i) {
            parity ^= data[i];
        }
        return parity;
    }
};
}
