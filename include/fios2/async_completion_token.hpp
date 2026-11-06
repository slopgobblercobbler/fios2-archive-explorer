#pragma once
#include <cstdint>

namespace fios2 {
struct AsyncCompletionToken {
    std::uint64_t request_id{0};
    std::int32_t result_code{0};
    std::uint64_t bytes_transferred{0};
    constexpr bool is_success() const noexcept {
        return result_code >= 0;
    }
};
}
