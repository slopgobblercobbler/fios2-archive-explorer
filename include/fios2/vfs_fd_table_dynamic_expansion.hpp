#pragma once
#include <cstdint>
#include <vector>

namespace fios2 {
struct VfsFdTableExpansion {
    static std::uint32_t expandCapacity(std::uint32_t currentCapacity, std::uint32_t maxLimit = 65536) {
        std::uint32_t next = currentCapacity * 2;
        if (next > maxLimit) next = maxLimit;
        return next;
    }
};
}
