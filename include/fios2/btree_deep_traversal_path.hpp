#pragma once
#include <cstdint>
#include <vector>

namespace fios2 {
struct BTreeTraversalPath {
    std::vector<std::uint64_t> path;
    void pushNode(std::uint64_t nodeIdx) { path.push_back(nodeIdx); }
    void popNode() { if (!path.empty()) path.pop_back(); }
    std::uint64_t currentNode() const { return path.empty() ? 0 : path.back(); }
};
}
