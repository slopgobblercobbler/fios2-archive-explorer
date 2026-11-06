#pragma once
#include <cstdint>

namespace fios2 {
struct Fios2AioBatchFlushBarrier {
    std::uint64_t pendingWriteBytes{0};
    static constexpr std::uint64_t FLUSH_THRESHOLD_BYTES = 4 * 1024 * 1024;
    void addWrittenBytes(std::uint64_t bytes) { pendingWriteBytes += bytes; }
    bool shouldFlush() const { return pendingWriteBytes >= FLUSH_THRESHOLD_BYTES; }
    void reset() { pendingWriteBytes = 0; }
};
}
