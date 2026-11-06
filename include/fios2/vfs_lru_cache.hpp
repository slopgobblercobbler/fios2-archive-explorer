#pragma once
#include <cstddef>

namespace fios2 {
struct VfsLruCacheConfig {
    static constexpr std::size_t max_entries = 1024;
    static constexpr std::size_t eviction_batch = 64;
    static constexpr bool requires_eviction(std::size_t current_count) noexcept {
        return current_count >= max_entries;
    }
};
}
