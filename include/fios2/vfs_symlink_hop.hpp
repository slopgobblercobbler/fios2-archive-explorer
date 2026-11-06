#pragma once
#include <cstdint>

namespace fios2 {
struct VfsSymlinkHop {
    static constexpr std::uint32_t max_hops = 32;
    static constexpr bool is_exceeded(std::uint32_t hops) noexcept {
        return hops >= max_hops;
    }
};
}
