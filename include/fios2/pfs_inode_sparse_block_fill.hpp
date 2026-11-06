#pragma once
#include <cstddef>
#include <cstdint>
#include <cstring>

namespace fios2 {
struct PfsSparseBlockFill {
    static void zeroFill(void* buffer, std::size_t size) {
        std::memset(buffer, 0, size);
    }
};
}
