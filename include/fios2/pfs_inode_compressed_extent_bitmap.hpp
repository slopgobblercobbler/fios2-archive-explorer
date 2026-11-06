#pragma once
#include <cstdint>
#include <vector>

namespace fios2 {
struct PfsCompressionBitmap {
    std::vector<std::uint64_t> bitmapWords;
    bool isCompressed(std::uint32_t extentIdx) const {
        std::size_t word = extentIdx / 64;
        std::size_t bit = extentIdx % 64;
        if (word >= bitmapWords.size()) return false;
        return (bitmapWords[word] & (1ULL << bit)) != 0;
    }
};
}
