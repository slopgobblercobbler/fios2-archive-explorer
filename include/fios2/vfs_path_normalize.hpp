#pragma once
#include <string_view>

namespace fios2 {
struct VfsPathNormalize {
    static constexpr bool is_dot(std::string_view comp) noexcept {
        return comp == ".";
    }
    static constexpr bool is_dot_dot(std::string_view comp) noexcept {
        return comp == "..";
    }
};
}
