#pragma once
#include <cstdint>
#include <vector>

namespace fios2 {
struct ReadVector {
    std::uint64_t offset;
    std::uint32_t size;
    void* buffer;
};

struct Fios2ReadVectorPacker {
    std::vector<ReadVector> vectors;
    void addVector(std::uint64_t off, std::uint32_t sz, void* buf) {
        vectors.push_back({off, sz, buf});
    }
};
}
