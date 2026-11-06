#pragma once
#include <cstdint>

namespace fios2 {
struct PfsBtreeSplitRoot {
    static constexpr std::uint32_t new_root_depth(std::uint32_t old_depth) noexcept {
        return old_depth + 1;
    }
};
}
