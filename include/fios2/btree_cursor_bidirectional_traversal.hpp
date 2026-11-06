#pragma once
#include <cstdint>

namespace fios2 {
struct BTreeCursorTraversal {
    std::uint64_t currentNodeIndex{0};
    std::uint32_t currentSlot{0};
    void stepForward(std::uint32_t maxSlots) {
        if (currentSlot + 1 < maxSlots) currentSlot++;
    }
    void stepBackward() {
        if (currentSlot > 0) currentSlot--;
    }
};
}
