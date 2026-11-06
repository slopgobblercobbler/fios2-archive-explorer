#pragma once
#include <cstdint>

namespace fios2 {
struct PfsBtreeRelink {
    static constexpr std::uint64_t sibling_link(std::uint64_t left_block, std::uint64_t right_block) noexcept {
        return left_block ^ right_block;
    }
};
}
