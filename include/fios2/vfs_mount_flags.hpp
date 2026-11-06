#pragma once
#include <cstdint>

namespace fios2 {
struct VfsMountFlags {
    static constexpr std::uint32_t mnt_rdonly = 0x00000001;
    static constexpr std::uint32_t mnt_nosuid = 0x00000008;
    static constexpr std::uint32_t mnt_noexec = 0x00000004;
    static constexpr bool is_read_only(std::uint32_t flags) noexcept {
        return (flags & mnt_rdonly) != 0;
    }
};
}
