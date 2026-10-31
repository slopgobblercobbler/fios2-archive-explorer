# FIOS2 Archive Explorer & PS5 PFS Inspector

[![Live Demo](https://img.shields.io/badge/demo-GitHub%20Pages-brightgreen?style=for-the-badge&logo=github)](https://slopgobblercobbler.github.io/fios2-archive-explorer/)
[![Tests](https://img.shields.io/badge/tests-13%2F13%20passing-success?style=for-the-badge)](https://github.com/slopgobblercobbler/fios2-archive-explorer/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

An interactive, production-grade, 100% client-side web application for inspecting, exploring, and decoding PlayStation Archive (`.psarc`) containers, PlayStation File System (`PFS`) container images, RAD Game Tools Oodle decompressor streams, and simulating the `libSceFios2` virtual filesystem overlay architecture.

Hosted live at: **[https://slopgobblercobbler.github.io/fios2-archive-explorer/](https://slopgobblercobbler.github.io/fios2-archive-explorer/)**

---

## Key Features

- **100% Client-Side Execution**: Runs entirely in modern browsers using Web Standards (HTML5, ES2022 Modules, DataView, CSS3 Variables). No external servers, zero backend requirements, zero tracking.
- **PSARC Archive Parser**:
  - Validates 32-byte header magic (`PSAR` / `0x50534152`), specification versions (v1.4, v1.3), and compression FourCC (`oodl`, `zlib`, `lz4 `, `lzma`, `none`).
  - Decodes Table of Contents (TOC) entries with 40-bit Big-Endian uncompressed size and data offset integers.
  - Resolves Manifest (TOC Entry 0) string tables and builds full relative directory trees.
  - Computes 64 KB chunk table boundaries, compressed block sizes, and decompressor expansion ratios.
- **PlayStation File System (PS5 PFS) Inspector**:
  - Superblock parser supporting PFS v1, v2, and v3 magics (`0x20150527`, `0x20130315`, `0x20170822`).
  - Reads Inode tables, POSIX permissions, directory modes (`0x0040`), file modes (`0x0020`), and direct/indirect block extents.
  - Reconstructs directory entries (`dirent`) from data blocks and extracts PlayStation Title IDs (`CUSA`/`PPSA`).
- **libSceFios2 Overlay Mount Simulator**:
  - Live simulation of `sceFiosOverlayAdd` and `sceFiosOverlayResolveSync`.
  - Normalizes virtual paths, removes redundant slashes, resolves `.`, and enforces path traversal defense (`../`).
  - Mount order priority engine: automatically resolves overrides across Base Disc (Order 0), Day-One Patch (Order 100), and DLC (Order 200).
  - Decompressor memory check: tests destination buffer allocations against chunk bounds, reporting `SCE_FIOS_ERROR_BUFFER_TOO_SMALL`.
- **AnyPS5 Security & Bounds Auditor**:
  - Comprehensive static audit of binary offsets, header integrity, chunk boundary containment, and compression ratios (zip-bomb defense).
  - Maps violations directly to FreeBSD / AnyPS5 error codes (`SCE_FIOS_ERROR_CORRUPT_ARCHIVE`, `SCE_FIOS_ERROR_PATH_TRAVERSAL`, `SCE_FIOS_ERROR_FILE_NOT_FOUND`).
- **Interactive Multi-View Workbench**:
  - **Directory Tree & File Inspector**: Collapsible directory hierarchy with search filtering and chunk decompression tables.
  - **Partition Map & Chunk Grid**: Visual memory layout breakdown (Header, TOC, Chunk Table, Payloads, Manifest) and hoverable 64KB chunk blocks.
  - **Header & Superblock Inspector**: Field-by-field breakdown with byte offsets, raw hex values, and specification rules.
  - **Overlay Simulator**: Interactive path query workbench with step-by-step resolution decision logs.
  - **Synchronized Hex Viewer**: 16-byte aligned hex view with ASCII pane and byte-range highlighting.
  - **Auditor Report**: Detailed invariant checklist with Pass/Warn/Fail badges.
- **Export & Portability**:
  - Export current container binary as `.psarc`, `.pfs`, or `.bin`.
  - Export full JSON inspection report including headers, file tables, and auditor telemetry.

---

## Built-In Sample Presets

| Preset | Description |
|---|---|
| **PS5 Game Title Update (PSARC + Oodle)** | Complete PSARC container with RAD Game Tools Oodle compression (`oodl`), TOC table, chunk sizes, and game binaries (`eboot.bin`, `shaders.sb`, `bgm.vag`). |
| **PS5 PFS Encrypted Container Image** | PlayStation File System (PFS v2) container with superblock, inode table, directory entries, and title ID (`PPSA01942`). |
| **Multi-Layer Overlay Mount** | Multi-layer overlay simulation demonstrating how Day-1 Patch v1.05 overrides files from Base Disc v1.00 and routes DLC to submounts. |
| **Corrupted FIOS2 Archive (Auditor Negative Test)** | Deliberately corrupted container with invalid magic, out-of-bounds TOC offset, and path traversal strings triggering security rejection. |

---

## Unit Test Suite

The repository includes a comprehensive unit test suite running on Node's native test runner (`node --test`), verifying parsing accuracy, offset calculations, path normalization, and error handling:

```bash
npm test
```

### Test Coverage Highlights:
- `test/psarc_parser.test.js`: Validates PSARC header magic, v1.4, FourCC, 40-bit integer reading, chunk table bounds, and EOF guards.
- `test/pfs_parser.test.js`: Validates PFS superblock v2, inode mode parsing, dirent resolution, and title ID extraction.
- `test/overlay_simulator.test.js`: Verifies `sceFiosPathNormalize`, path traversal rejection, mount order priority overrides, and buffer boundary checks.
- `test/fios2_auditor.test.js`: Audits authentic containers against corrupted binaries, verifying negative error detection.

---

## Automated Deployment

Deployments to GitHub Pages are fully automated using GitHub Actions (`.github/workflows/deploy-pages.yml`):
1. **Test Phase**: Runs `npm test` across all unit test suites on Node.js 22.
2. **Deploy Phase**: Uploads static assets via `actions/upload-pages-artifact@v3` and deploys directly to GitHub Pages via `actions/deploy-pages@v4`.

---

## License

MIT License &copy; 2026 slopgobblercobbler
