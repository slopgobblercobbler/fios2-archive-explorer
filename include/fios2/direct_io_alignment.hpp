#pragma once
#include <cstdint>
#include <cstddef>

namespace fios2 {
struct DirectIoAlignment {
    static constexpr std::size_t required_alignment = 4096;
    static constexpr bool is_aligned(std::uintptr_t addr, std::size_t size) noexcept {
        return (addr % required_alignment == 0) && (size % required_alignment == 0);
    }
};
}
