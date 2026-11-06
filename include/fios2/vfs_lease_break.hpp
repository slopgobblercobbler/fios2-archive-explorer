#pragma once
#include <cstdint>

namespace fios2 {
struct VfsLeaseBreak {
    static constexpr std::uint64_t default_timeout_ms = 5000;
    static constexpr bool is_expired(std::uint64_t start_ms, std::uint64_t current_ms) noexcept {
        return (current_ms >= start_ms) && ((current_ms - start_ms) >= default_timeout_ms);
    }
};
}
