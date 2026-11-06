#pragma once
#include <cstdint>
#include <cstddef>

namespace fios2 {
struct DirectBufferPool {
    static constexpr std::size_t slot_size = 64 * 1024;
    static constexpr std::size_t num_slots = 32;
    static constexpr std::size_t pool_capacity = slot_size * num_slots;
};
}
