#pragma once
#include <cstdint>

namespace fios2 {
struct Fios2ThroughputMeter {
    std::uint64_t totalBytesTransferred{0};
    double totalTimeSeconds{0.0};
    void recordTransfer(std::uint64_t bytes, double dt) {
        totalBytesTransferred += bytes;
        totalTimeSeconds += dt;
    }
    double averageThroughputBytesPerSec() const {
        if (totalTimeSeconds <= 0.0001) return 0.0;
        return static_cast<double>(totalBytesTransferred) / totalTimeSeconds;
    }
};
}
