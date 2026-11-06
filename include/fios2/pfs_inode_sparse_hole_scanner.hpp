#pragma once
#include <cstdint>

namespace fios2 {
struct PfsSparseHoleScanner {
    static bool isHole(std::uint64_t physicalBlock) {
        return physicalBlock == 0 || physicalBlock == 0xFFFFFFFFFFFFFFFFULL;
    }
};
}
