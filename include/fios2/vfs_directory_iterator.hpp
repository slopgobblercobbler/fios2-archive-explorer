#pragma once
#include <cstdint>
#include <cstddef>

namespace fios2 {
struct VfsDirectoryIterator {
    std::size_t current_offset{0};
    constexpr bool has_next(std::size_t total_entries) const noexcept {
        return current_offset < total_entries;
    }
    constexpr void advance() noexcept {
        ++current_offset;
    }
};
}
