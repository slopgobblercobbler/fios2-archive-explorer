#pragma once
#include <cstdint>

namespace fios2 {
struct PfsInodeGen {
    static constexpr std::uint32_t next_generation(std::uint32_t current) noexcept {
        return (current == 0xFFFFFFFF) ? 1 : (current + 1);
    }
};
}
