#pragma once
#include <cstdint>
#include <string_view>

namespace fios2 {
struct PfsInlineSymlinkStorage {
    static constexpr std::uint32_t MAX_INLINE_SYMLINK_BYTES = 120;
    static bool canStoreInline(std::string_view targetPath) {
        return targetPath.size() <= MAX_INLINE_SYMLINK_BYTES;
    }
};
}
