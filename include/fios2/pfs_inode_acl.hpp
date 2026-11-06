#pragma once
#include <cstdint>

namespace fios2 {
struct PfsInodeAcl {
    static constexpr std::uint32_t acl_tag_user = 0x01;
    static constexpr std::uint32_t acl_tag_group = 0x02;
    static constexpr std::uint32_t acl_tag_other = 0x04;
    static constexpr bool has_user_access(std::uint32_t tag) noexcept {
        return (tag & acl_tag_user) != 0;
    }
};
}
