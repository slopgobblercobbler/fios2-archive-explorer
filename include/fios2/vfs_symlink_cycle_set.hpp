#pragma once
#include <cstdint>
#include <array>

namespace fios2 {
struct VfsSymlinkCycleSet {
    static constexpr std::size_t max_visited = 32;
    std::array<std::uint64_t, max_visited> visited_inodes{};
    std::size_t count{0};
    bool insert(std::uint64_t ino) noexcept {
        for (std::size_t i = 0; i < count; ++i) {
            if (visited_inodes[i] == ino) return false;
        }
        if (count < max_visited) visited_inodes[count++] = ino;
        return true;
    }
};
}
