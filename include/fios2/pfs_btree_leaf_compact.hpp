#pragma once
#include <cstdint>
#include <cstddef>

namespace fios2 {
struct PfsBtreeLeafCompact {
    static constexpr std::size_t compact_threshold = 32;
    static constexpr bool should_compact(std::size_t empty_slots) noexcept {
        return empty_slots >= compact_threshold;
    }
};
}
