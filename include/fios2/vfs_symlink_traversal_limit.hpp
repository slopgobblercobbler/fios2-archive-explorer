#pragma once
#include <cstdint>

namespace fios2 {
struct VfsSymlinkTraversalLimit {
    static constexpr std::uint32_t MAX_SYMLINK_DEPTH = 32;
    static bool isDepthExceeded(std::uint32_t currentDepth) {
        return currentDepth >= MAX_SYMLINK_DEPTH;
    }
};
}
