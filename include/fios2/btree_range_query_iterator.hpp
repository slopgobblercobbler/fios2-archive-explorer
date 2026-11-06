#pragma once
#include <cstdint>

namespace fios2 {
struct BTreeRangeQueryIterator {
    std::uint64_t startKey;
    std::uint64_t endKey;
    bool inclusive;
    bool inRange(std::uint64_t key) const {
        if (inclusive) return key >= startKey && key <= endKey;
        return key >= startKey && key < endKey;
    }
};
}
