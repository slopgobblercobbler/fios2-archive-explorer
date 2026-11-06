#pragma once
#include <cstdint>

namespace fios2 {
struct VfsLockUpgrade {
    static constexpr bool is_upgrade(std::uint16_t old_type, std::uint16_t new_type) noexcept {
        return (old_type == 1) && (new_type == 2);
    }
};
}
