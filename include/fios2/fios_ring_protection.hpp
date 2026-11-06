#pragma once
#include <cstdint>
#include <cstddef>

namespace fios2 {
struct FiosRingProtection {
    static constexpr bool is_overflow(std::size_t head, std::size_t tail, std::size_t capacity) noexcept {
        return ((head + 1) % capacity) == tail;
    }
};
}
