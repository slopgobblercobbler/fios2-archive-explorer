#pragma once
#include <cstdint>

namespace fios2 {
struct PfsBtreeRebalance {
    static constexpr std::size_t min_keys = 64;
    static constexpr std::size_t max_keys = 128;
    static constexpr bool requires_split(std::size_t current_keys) noexcept {
        return current_keys >= max_keys;
    }
    static constexpr bool requires_merge(std::size_t current_keys) noexcept {
        return current_keys < min_keys;
    }
};
}
