#pragma once
#include <cstdint>

namespace fios2 {
struct PfsBlockHashLookup {
    static constexpr std::uint32_t slot_for_hash(std::uint64_t hash, std::uint32_t table_size) noexcept {
        return static_cast<std::uint32_t>(hash % table_size);
    }
};
}
