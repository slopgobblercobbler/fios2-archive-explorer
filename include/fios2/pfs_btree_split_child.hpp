#pragma once
#include <cstdint>

namespace fios2 {
struct PfsBtreeSplitChild {
    static constexpr std::uint32_t median_key_index(std::uint32_t total_keys) noexcept {
        return total_keys / 2;
    }
};
}
