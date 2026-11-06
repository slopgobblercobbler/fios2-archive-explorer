#pragma once
#include <string>

namespace fios2 {
struct VfsAtomicRenameTransaction {
    std::string sourcePath;
    std::string destinationPath;
    bool committed{false};
    void commit() { committed = true; }
    void rollback() { committed = false; }
};
}
