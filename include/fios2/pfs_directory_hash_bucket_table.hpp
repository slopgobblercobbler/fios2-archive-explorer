#pragma once
#include <cstdint>
#include <vector>

namespace fios2 {
struct PfsHashBucket {
    std::uint32_t hash;
    std::uint64_t inodeNumber;
};

struct PfsDirectoryHashBucketTable {
    std::vector<PfsHashBucket> buckets;
    void insert(std::uint32_t h, std::uint64_t ino) { buckets.push_back({h, ino}); }
};
}
