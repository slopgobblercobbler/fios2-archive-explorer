#pragma once
#include <cstdint>
#include <vector>

namespace fios2 {
struct Fios2LatencyHistogram {
    std::vector<std::uint64_t> buckets{0, 0, 0, 0, 0};
    void recordLatencyUs(std::uint64_t us) {
        if (us < 1000) buckets[0]++;
        else if (us < 5000) buckets[1]++;
        else if (us < 10000) buckets[2]++;
        else if (us < 50000) buckets[3]++;
        else buckets[4]++;
    }
};
}
