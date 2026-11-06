#pragma once
#include <cstdint>
#include <cstddef>

namespace fios2 {
struct PfsInodeEa {
    static constexpr std::size_t inline_ea_size = 256;
    static constexpr bool is_inline(std::size_t ea_bytes) noexcept {
        return ea_bytes <= inline_ea_size;
    }
};
}
