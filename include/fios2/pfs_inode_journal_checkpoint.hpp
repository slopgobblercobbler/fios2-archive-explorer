#pragma once
#include <cstdint>

namespace fios2 {
struct PfsJournalCheckpoint {
    std::uint64_t transactionId;
    std::uint64_t timestamp;
    bool flushedToDisk{false};
    void markFlushed() { flushedToDisk = true; }
};
}
