#pragma once
#include <cstdint>

namespace fios2 {
struct VfsLockMerge {
    static constexpr bool can_merge(std::int64_t end1, std::int64_t start2) noexcept {
        return end1 == start2 || (end1 != -1 && end1 + 1 == start2);
    }
};
}
