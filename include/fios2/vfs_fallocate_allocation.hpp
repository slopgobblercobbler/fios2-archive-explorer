#pragma once
#include <cstdint>

namespace fios2 {
struct VfsFallocateAllocation {
    static bool preallocate(std::uint64_t currentSize, std::uint64_t requestedSize, std::uint64_t& outAllocated) {
        if (requestedSize < currentSize) return false;
        outAllocated = requestedSize;
        return true;
    }
};
}
