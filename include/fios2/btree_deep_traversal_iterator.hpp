#pragma once
#include <cstdint>
#include <vector>

namespace fios2 {
struct BTreeInOrderIterator {
    std::vector<std::uint64_t> visitedKeys;
    void recordKey(std::uint64_t k) { visitedKeys.push_back(k); }
    std::size_t count() const { return visitedKeys.size(); }
};
}
