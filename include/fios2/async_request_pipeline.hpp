#pragma once
#include <cstdint>
#include <cstddef>

namespace fios2 {
struct AsyncRequestPipeline {
    static constexpr std::size_t max_in_flight_ops = 64;
    static constexpr std::size_t ring_mask = max_in_flight_ops - 1;
    static constexpr std::size_t next_slot(std::size_t head) noexcept {
        return (head + 1) & ring_mask;
    }
};
}
