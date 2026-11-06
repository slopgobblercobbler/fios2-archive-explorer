#pragma once
#include <cstdint>
#include <cstddef>

namespace fios2 {
struct ReadPrefetchCache {
    static constexpr std::size_t default_chunk = 128 * 1024;
    static constexpr std::size_t prefetch_blocks(std::size_t requested_bytes) noexcept {
        return (requested_bytes + default_chunk - 1) / default_chunk;
    }
};
}
