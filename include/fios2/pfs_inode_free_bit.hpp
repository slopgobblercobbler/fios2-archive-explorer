#pragma once
#include <cstdint>
#include <bit>

namespace fios2 {
struct PfsInodeFreeBit {
    static constexpr int find_first_free(std::uint64_t bitmap_word) noexcept {
        return (bitmap_word == ~0ULL) ? -1 : std::countr_one(bitmap_word);
    }
};
}
