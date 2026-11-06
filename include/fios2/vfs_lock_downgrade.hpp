#pragma once
#include <cstdint>

namespace fios2 {
struct VfsLockDowngrade {
    static constexpr bool is_downgrade(std::uint16_t old_type, std::uint16_t new_type) noexcept {
        return (old_type == 2) && (new_type == 1);
    }
};
}
