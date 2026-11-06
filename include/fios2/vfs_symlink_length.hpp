#pragma once
#include <cstddef>

namespace fios2 {
struct VfsSymlinkLength {
    static constexpr std::size_t max_target_len = 1024;
    static constexpr bool is_valid_length(std::size_t len) noexcept {
        return len > 0 && len <= max_target_len;
    }
};
}
