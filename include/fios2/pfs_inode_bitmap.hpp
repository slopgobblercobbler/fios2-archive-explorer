#pragma once
#include <cstdint>
#include <cstddef>

namespace fios2 {
struct PfsInodeBitmap {
    static constexpr std::size_t inodes_per_block = 4096 * 8;
    static constexpr std::size_t block_index_for_inode(std::uint64_t inode_num) noexcept {
        return static_cast<std::size_t>(inode_num / inodes_per_block);
    }
    static constexpr std::size_t bit_offset_in_block(std::uint64_t inode_num) noexcept {
        return static_cast<std::size_t>(inode_num % inodes_per_block);
    }
};
}
