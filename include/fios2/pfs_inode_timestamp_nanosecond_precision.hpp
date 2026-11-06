#pragma once
#include <cstdint>

namespace fios2 {
struct PfsTimestamp {
    std::uint64_t seconds;
    std::uint32_t nanoseconds;
};
}
