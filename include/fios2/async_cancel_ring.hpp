#pragma once
#include <cstdint>
#include <cstddef>

namespace fios2 {
struct AsyncCancelRing {
    static constexpr std::size_t max_cancel_ops = 32;
    static constexpr bool is_cancellable(std::uint32_t state) noexcept {
        return state == 1; // Pending
    }
};
}
