#pragma once
#include <cstdint>

namespace fios2 {
struct VfsFdTableCleaner {
    static std::uint32_t findHighestOpenFd(const bool* openBitset, std::uint32_t capacity) {
        for (std::int32_t i = static_cast<std::int32_t>(capacity) - 1; i >= 0; --i) {
            if (openBitset[i]) return static_cast<std::uint32_t>(i);
        }
        return 0;
    }
};
}
