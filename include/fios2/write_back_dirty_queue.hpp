#pragma once
#include <cstdint>
#include <cstddef>

namespace fios2 {
struct WriteBackDirtyQueue {
    static constexpr std::size_t max_dirty_blocks = 256;
    static constexpr bool requires_flush(std::size_t dirty_count) noexcept {
        return dirty_count >= max_dirty_blocks;
    }
};
}
