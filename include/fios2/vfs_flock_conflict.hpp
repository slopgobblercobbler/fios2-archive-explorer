#pragma once
#include <cstdint>

namespace fios2 {
enum class LockType : std::uint16_t { Shared = 1, Exclusive = 2, Unlock = 3 };

struct VfsFlockConflict {
    static constexpr bool has_overlap(std::int64_t start1, std::int64_t len1,
                                      std::int64_t start2, std::int64_t len2) noexcept {
        const std::int64_t end1 = (len1 == 0) ? -1 : (start1 + len1);
        const std::int64_t end2 = (len2 == 0) ? -1 : (start2 + len2);
        if (end1 != -1 && start2 >= end1) return false;
        if (end2 != -1 && start1 >= end2) return false;
        return true;
    }
    static constexpr bool is_conflict(LockType t1, LockType t2) noexcept {
        if (t1 == LockType::Unlock || t2 == LockType::Unlock) return false;
        return (t1 == LockType::Exclusive || t2 == LockType::Exclusive);
    }
};
}
