#pragma once
#include <cstdint>
#include <array>

namespace fios2 {
struct VfsDeadlockDetector {
    static constexpr std::size_t max_nodes = 16;
    std::array<std::uint16_t, max_nodes> wait_for{};
    bool has_cycle(std::uint16_t start_node) const noexcept {
        std::uint16_t curr = start_node;
        for (std::size_t i = 0; i < max_nodes; ++i) {
            if (curr >= max_nodes) return false;
            curr = wait_for[curr];
            if (curr == start_node) return true;
        }
        return false;
    }
};
}
