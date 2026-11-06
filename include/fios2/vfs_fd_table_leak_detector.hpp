#pragma once
#include <cstdint>
#include <vector>

namespace fios2 {
struct VfsFdLeakDetector {
    static std::vector<std::uint32_t> findOpenDescriptors(const bool* openBitset, std::uint32_t capacity) {
        std::vector<std::uint32_t> openFds;
        for (std::uint32_t i = 0; i < capacity; ++i) {
            if (openBitset[i]) openFds.push_back(i);
        }
        return openFds;
    }
};
}
