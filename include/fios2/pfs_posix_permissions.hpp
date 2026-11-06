#pragma once
#include <cstdint>

namespace fios2 {
struct PfsPosixPermissions {
    static constexpr std::uint16_t s_irwxu = 00700;
    static constexpr std::uint16_t s_irwxg = 00070;
    static constexpr std::uint16_t s_irwxo = 00007;
    static constexpr bool has_user_exec(std::uint16_t mode) noexcept {
        return (mode & 00100) != 0;
    }
};
}
