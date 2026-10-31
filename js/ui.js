import { BinaryReader } from './binary_reader.js';

/**
 * UI Renderer for FIOS2 Archive Explorer
 */
export class UI {
  /**
   * Display top alert banner
   */
  static showAlert(message, type = 'error') {
    const container = document.getElementById('alert-container');
    if (!container) return;
    container.className = `alert alert-${type}`;
    container.innerHTML = `
      <span>${message}</span>
      <button class="btn btn-sm" onclick="this.parentElement.style.display='none'">&times;</button>
    `;
    container.style.display = 'flex';
  }

  static hideAlert() {
    const container = document.getElementById('alert-container');
    if (container) container.style.display = 'none';
  }

  /**
   * Update top telemetry cards
   */
  static updateTelemetry(parsed, audit) {
    const elFormat = document.getElementById('stats-format');
    const elFiles = document.getElementById('stats-files');
    const elUncompressed = document.getElementById('stats-uncompressed');
    const elCompressed = document.getElementById('stats-compressed');
    const elAudit = document.getElementById('stats-audit');

    if (parsed.type === 'PSARC') {
      elFormat.textContent = `PSARC v${parsed.header.version} (${parsed.header.compression.toUpperCase()})`;
      elFiles.textContent = parsed.totalFiles.toLocaleString();
      elUncompressed.textContent = BinaryReader.formatBytes(parsed.totalUncompressedBytes);
      elCompressed.textContent = `${BinaryReader.formatBytes(parsed.totalCompressedBytes)} (${parsed.overallSavingsPercent}%)`;
    } else if (parsed.type === 'PFS') {
      elFormat.textContent = `PS5 PFS v${parsed.superblock.version}`;
      elFiles.textContent = `${parsed.totalFiles} files (${parsed.inodes.length} inodes)`;
      elUncompressed.textContent = BinaryReader.formatBytes(parsed.totalBytes);
      elCompressed.textContent = 'RAW / Container';
    }

    if (audit) {
      if (audit.passed) {
        elAudit.className = 'stat-value ok';
        elAudit.textContent = 'PASS';
      } else {
        elAudit.className = 'stat-value fail';
        elAudit.textContent = 'FAIL';
      }
    }
  }

  /**
   * Build directory tree from file entries
   */
  static renderTree(entries, filterText = '', onSelect) {
    const container = document.getElementById('tree-view');
    if (!container) return;
    container.innerHTML = '';

    const root = { name: '/', isDir: true, children: {}, entry: null };

    // Build hierarchy
    for (const entry of entries) {
      if (entry.isManifest) continue;
      const path = entry.path.startsWith('/') ? entry.path.slice(1) : entry.path;
      const parts = path.split('/');

      let current = root;
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        const isLeaf = i === parts.length - 1;

        if (isLeaf && !entry.isDir) {
          current.children[part] = { name: part, isDir: false, entry };
        } else {
          if (!current.children[part]) {
            current.children[part] = { name: part, isDir: true, children: {}, entry: null };
          }
          current = current.children[part];
        }
      }
    }

    // Render tree recursively
    const renderNode = (node, depth = 0, currentPath = '') => {
      const fullPath = currentPath + '/' + node.name;
      const matchesFilter = filterText === '' || fullPath.toLowerCase().includes(filterText.toLowerCase());

      const el = document.createElement('div');
      el.className = 'tree-node';
      el.style.paddingLeft = `${depth * 14 + 6}px`;

      if (node.isDir) {
        el.innerHTML = `
          <span class="tree-node-icon">📁</span>
          <span class="tree-node-name" style="font-weight: 600;">${node.name}</span>
        `;
      } else {
        const sizeStr = BinaryReader.formatBytes(node.entry.uncompressedSize || node.entry.size || 0);
        el.innerHTML = `
          <span class="tree-node-icon">📄</span>
          <span class="tree-node-name">${node.name}</span>
          <span class="tree-node-size">${sizeStr}</span>
        `;

        el.addEventListener('click', () => {
          document.querySelectorAll('.tree-node.selected').forEach(n => n.classList.remove('selected'));
          el.classList.add('selected');
          if (onSelect) onSelect(node.entry);
        });
      }

      if (matchesFilter) {
        container.appendChild(el);
      }

      if (node.isDir && node.children) {
        const sortedKeys = Object.keys(node.children).sort((a, b) => {
          const aIsDir = node.children[a].isDir;
          const bIsDir = node.children[b].isDir;
          if (aIsDir && !bIsDir) return -1;
          if (!aIsDir && bIsDir) return 1;
          return a.localeCompare(b);
        });

        for (const key of sortedKeys) {
          renderNode(node.children[key], depth + 1, currentPath === '' ? '' : fullPath);
        }
      }
    };

    if (root.children) {
      for (const k of Object.keys(root.children)) {
        renderNode(root.children[k], 0, '');
      }
    }
  }

  /**
   * Render file inspector details and chunk table
   */
  static renderFileDetails(entry, onJumpHex) {
    if (!entry) return;

    document.getElementById('fi-path').textContent = entry.path || 'Unknown';
    document.getElementById('fi-size').textContent = BinaryReader.formatBytes(entry.uncompressedSize || entry.size || 0);
    document.getElementById('fi-comp-size').textContent = entry.compressedSize !== undefined ? BinaryReader.formatBytes(entry.compressedSize) : 'N/A';
    document.getElementById('fi-ratio').textContent = entry.compressionRatio ? `${entry.compressionRatio}% savings` : '0.0%';
    document.getElementById('fi-offset').textContent = entry.dataOffset !== undefined ? BinaryReader.toHex(entry.dataOffset) : (entry.offset ? BinaryReader.toHex(entry.offset) : 'N/A');
    document.getElementById('fi-min-buffer').textContent = entry.requiredBufferSize !== undefined ? BinaryReader.formatBytes(entry.requiredBufferSize) : '64 KB';

    const btnJump = document.getElementById('btn-jump-hex');
    btnJump.onclick = () => {
      const offset = entry.dataOffset !== undefined ? entry.dataOffset : (entry.offset || 0);
      if (onJumpHex) onJumpHex(offset, entry.compressedSize || entry.size || 64);
    };

    // Render Chunks Table
    const tbody = document.getElementById('chunks-table-body');
    tbody.innerHTML = '';

    if (entry.chunks && entry.chunks.length > 0) {
      entry.chunks.forEach((c, idx) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${idx + 1}</td>
          <td>${BinaryReader.toHex(c.blockOffset)}</td>
          <td>${BinaryReader.formatBytes(c.compressedSize)}</td>
          <td>${BinaryReader.formatBytes(c.uncompressedSize)}</td>
          <td><span class="finding-badge ${c.isCompressed ? 'pass' : 'warn'}">${c.isCompressed ? 'Compressed' : 'Raw 64KB'}</span></td>
        `;
        tbody.appendChild(tr);
      });
    } else {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-dim);">No chunk table available for this entry</td></tr>`;
    }
  }

  /**
   * Render Header & Superblock Table
   */
  static renderHeaderTable(parsed) {
    const tbody = document.getElementById('header-table-body');
    tbody.innerHTML = '';

    const rows = [];
    if (parsed.type === 'PSARC') {
      const h = parsed.header;
      rows.push(
        { offset: '0x0000', size: '4 B', name: 'Magic Signature', hex: '0x50534152', val: `"${h.magic}"`, spec: 'Must be "PSAR" (0x50534152)' },
        { offset: '0x0004', size: '2 B', name: 'Major Version', hex: BinaryReader.toHex(h.versionMajor, 4), val: `${h.versionMajor}`, spec: 'PSARC format version 1' },
        { offset: '0x0006', size: '2 B', name: 'Minor Version', hex: BinaryReader.toHex(h.versionMinor, 4), val: `${h.versionMinor}`, spec: 'Revision 4 (PlayStation 3/4/5 standard)' },
        { offset: '0x0008', size: '4 B', name: 'Compression FourCC', hex: BinaryReader.toHex(0, 8), val: `"${h.compression}" (${h.compressionName})`, spec: 'Supported: oodl, zlib, lz4, lzma, none' },
        { offset: '0x000C', size: '4 B', name: 'TOC Offset', hex: BinaryReader.toHex(h.tocOffset), val: `${h.tocOffset} bytes`, spec: 'TOC file table starts immediately after header' },
        { offset: '0x0010', size: '4 B', name: 'TOC Entry Size', hex: BinaryReader.toHex(h.tocEntrySize), val: `${h.tocEntrySize} bytes`, spec: 'Standard: 30 bytes (or 32 bytes)' },
        { offset: '0x0014', size: '4 B', name: 'TOC Entry Count', hex: BinaryReader.toHex(h.tocEntriesCount), val: `${h.tocEntriesCount} entries`, spec: 'Entry 0 is manifest, followed by N files' },
        { offset: '0x0018', size: '4 B', name: 'Block Chunk Size', hex: BinaryReader.toHex(h.blockSize), val: `${h.blockSize} bytes (${h.blockSize / 1024} KB)`, spec: 'Default uncompressed chunk size: 65,536 B' },
        { offset: '0x001C', size: '4 B', name: 'Archive Flags', hex: BinaryReader.toHex(h.archiveFlags), val: `0x${h.archiveFlags.toString(16)} (Relative: ${h.flagsDecoded.relativePaths})`, spec: 'Bit 0: Relative, Bit 1: Case-insensitive' }
      );
    } else if (parsed.type === 'PFS') {
      const sb = parsed.superblock;
      rows.push(
        { offset: '0x0000', size: '4 B', name: 'PFS Magic Signature', hex: sb.magic, val: `${sb.magic} (${sb.isLittleEndian ? 'x86-64 LE' : 'BE'})`, spec: 'Valid: 0x20150527, 0x20130315, 0x20170822' },
        { offset: '0x0004', size: '4 B', name: 'Superblock Version', hex: BinaryReader.toHex(sb.version), val: `Version ${sb.version}`, spec: 'PS5 PFS Version 2' },
        { offset: '0x0008', size: '4 B', name: 'Mode Flags', hex: BinaryReader.toHex(sb.mode), val: `RO:${sb.modeDecoded.readOnly} | Enc:${sb.modeDecoded.encrypted} | Signed:${sb.modeDecoded.signedIcv}`, spec: 'Bitmask of container security attributes' },
        { offset: '0x000C', size: '4 B', name: 'Filesystem Block Size', hex: BinaryReader.toHex(sb.blockSize), val: `${sb.blockSize} bytes (${sb.blockSize / 1024} KB)`, spec: 'Standard PFS sector: 4096 bytes' },
        { offset: '0x0010', size: '8 B', name: 'Total Block Count', hex: BinaryReader.toHex(sb.blockCount), val: `${sb.blockCount} blocks`, spec: 'Total partition sectors' },
        { offset: '0x0018', size: '4 B', name: 'Inode Block Count', hex: BinaryReader.toHex(sb.inodeBlockCount), val: `${sb.inodeBlockCount} block(s)`, spec: 'Sectors allocated for inode table' },
        { offset: '0x001C', size: '4 B', name: 'Total Inode Count', hex: BinaryReader.toHex(sb.inodeCount), val: `${sb.inodeCount} inodes`, spec: 'Maximum directory and file nodes' },
        { offset: '0x0020', size: '4 B', name: 'Root Inode Index', hex: BinaryReader.toHex(sb.rootInodeIndex), val: `Inode #${sb.rootInodeIndex}`, spec: 'Filesystem root directory node' },
        { offset: '0x0028', size: '16 B', name: 'Volume Title ID', hex: '-', val: `"${sb.titleId}"`, spec: 'PlayStation Title Identifier (CUSA/PPSA)' },
        { offset: '0x0038', size: '8 B', name: 'ICV Offset', hex: BinaryReader.toHex(sb.icvOffset), val: `${sb.icvOffset} bytes`, spec: 'Integrity Control Value HMAC table' }
      );
    }

    for (const r of rows) {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${r.offset}</td>
        <td>${r.size}</td>
        <td style="color: var(--accent-cyan); font-weight: 600;">${r.name}</td>
        <td>${r.hex}</td>
        <td>${r.val}</td>
        <td style="color: var(--text-muted);">${r.spec}</td>
      `;
      tbody.appendChild(tr);
    }
  }

  /**
   * Render Partition Map and Chunk Grid
   */
  static renderPartitionMap(parsed, onJumpHex) {
    const bar = document.getElementById('partition-bar');
    const metrics = document.getElementById('partition-metrics');
    const chunkGrid = document.getElementById('chunk-grid');

    bar.innerHTML = '';
    metrics.innerHTML = '';
    chunkGrid.innerHTML = '';

    if (parsed.type === 'PSARC') {
      const total = parsed.archiveTotalBytes || 1;
      const h = parsed.header;
      const tocLen = h.tocEntriesCount * h.tocEntrySize;
      const chunkLen = parsed.chunkTable.length * 2;
      const dataLen = total - (h.tocOffset + tocLen + chunkLen);

      const segments = [
        { name: 'Header', size: 32, color: '#3b82f6', offset: 0 },
        { name: 'TOC Table', size: tocLen, color: '#8b5cf6', offset: h.tocOffset },
        { name: 'Chunk Table', size: chunkLen, color: '#00f0ff', offset: h.tocOffset + tocLen },
        { name: 'Data Payloads', size: Math.max(0, dataLen), color: '#10b981', offset: h.tocOffset + tocLen + chunkLen }
      ];

      for (const seg of segments) {
        const pct = Math.max(1, (seg.size / total) * 100).toFixed(1);
        const div = document.createElement('div');
        div.className = 'partition-segment';
        div.style.width = `${pct}%`;
        div.style.backgroundColor = seg.color;
        div.title = `${seg.name}: ${BinaryReader.formatBytes(seg.size)} (${pct}%) @ ${BinaryReader.toHex(seg.offset)}`;
        div.textContent = `${seg.name} (${pct}%)`;
        div.onclick = () => {
          if (onJumpHex) onJumpHex(seg.offset, seg.size);
        };
        bar.appendChild(div);

        // Metrics card
        const card = document.createElement('div');
        card.className = 'detail-item';
        card.innerHTML = `
          <div class="detail-label">${seg.name}</div>
          <div class="detail-value" style="color: ${seg.color};">${BinaryReader.formatBytes(seg.size)}</div>
          <div style="font-size: 0.72rem; color: var(--text-dim);">${BinaryReader.toHex(seg.offset)}</div>
        `;
        metrics.appendChild(card);
      }

      // Populate Chunk Grid
      parsed.entries.forEach(entry => {
        if (!entry.chunks) return;
        entry.chunks.forEach((c) => {
          const chunkEl = document.createElement('div');
          chunkEl.className = `chunk-block ${c.isCompressed ? 'compressed' : 'uncompressed'}`;
          chunkEl.textContent = `${c.chunkIndex}`;
          chunkEl.title = `File: ${entry.path}\nChunk #${c.chunkIndex}\nCompressed: ${c.compressedSize} B\nUncompressed: ${c.uncompressedSize} B`;
          chunkEl.onclick = () => {
            if (onJumpHex) onJumpHex(c.blockOffset, c.compressedSize);
          };
          chunkGrid.appendChild(chunkEl);
        });
      });
    } else if (parsed.type === 'PFS') {
      const total = parsed.totalBytes;
      const sb = parsed.superblock;
      const inodeTableSize = sb.inodeBlockCount * sb.blockSize;
      const dataSize = total - (sb.blockSize + inodeTableSize);

      const segments = [
        { name: 'Superblock', size: sb.blockSize, color: '#3b82f6', offset: 0 },
        { name: 'Inode Table', size: inodeTableSize, color: '#8b5cf6', offset: sb.blockSize },
        { name: 'Data Blocks', size: Math.max(0, dataSize), color: '#10b981', offset: sb.blockSize + inodeTableSize }
      ];

      for (const seg of segments) {
        const pct = Math.max(1, (seg.size / total) * 100).toFixed(1);
        const div = document.createElement('div');
        div.className = 'partition-segment';
        div.style.width = `${pct}%`;
        div.style.backgroundColor = seg.color;
        div.textContent = `${seg.name} (${pct}%)`;
        div.title = `${seg.name}: ${BinaryReader.formatBytes(seg.size)} @ ${BinaryReader.toHex(seg.offset)}`;
        div.onclick = () => {
          if (onJumpHex) onJumpHex(seg.offset, seg.size);
        };
        bar.appendChild(div);
      }
    }
  }

  /**
   * Render Overlay Simulator Layers and Resolution Trace
   */
  static renderOverlaySimulator(simulator, onResolve) {
    const listEl = document.getElementById('overlay-layers-list');
    listEl.innerHTML = '';

    const overlays = simulator.getOverlays();
    if (overlays.length === 0) {
      listEl.innerHTML = '<div style="color: var(--text-dim); font-size: 0.8rem;">No overlays currently mounted.</div>';
    } else {
      for (const layer of overlays) {
        const item = document.createElement('div');
        item.className = 'overlay-layer-item';
        item.innerHTML = `
          <div>
            <div style="font-weight: 700; font-size: 0.85rem; color: #fff;">${layer.name}</div>
            <div style="font-size: 0.75rem; color: var(--text-muted);">Mount Point: <code>${layer.mountPoint}</code> &bull; Files: ${layer.files.size}</div>
          </div>
          <span class="layer-badge">Order ${layer.order}</span>
        `;
        listEl.appendChild(item);
      }
    }
  }

  static renderResolutionTrace(result) {
    const traceContainer = document.getElementById('overlay-trace-flow');
    traceContainer.innerHTML = '';

    if (!result || !result.trace) return;

    for (const line of result.trace) {
      const div = document.createElement('div');
      div.className = 'trace-line';
      if (line.includes('[SUCCESS]')) div.classList.add('success');
      if (line.includes('[FAIL]')) div.classList.add('fail');
      div.textContent = line;
      traceContainer.appendChild(div);
    }
  }

  /**
   * Render Hex Viewer with Address, Hex Bytes, and ASCII
   */
  static renderHexViewer(rawBytes, startOffset = 0, length = 512, highlightRange = null) {
    const container = document.getElementById('hex-viewer');
    container.innerHTML = '';

    const rows = BinaryReader.toHexDump(rawBytes, startOffset, length);
    for (const r of rows) {
      const div = document.createElement('div');
      div.className = 'hex-row';

      const addrSpan = document.createElement('span');
      addrSpan.className = 'hex-addr';
      addrSpan.textContent = r.address;

      const bytesSpan = document.createElement('span');
      bytesSpan.className = 'hex-bytes';

      // Check if row overlaps with highlightRange
      if (highlightRange && r.offset + 16 > highlightRange.start && r.offset < highlightRange.end) {
        bytesSpan.classList.add('hex-highlight');
      }
      bytesSpan.textContent = r.hex;

      const asciiSpan = document.createElement('span');
      asciiSpan.className = 'hex-ascii';
      asciiSpan.textContent = r.ascii;

      div.appendChild(addrSpan);
      div.appendChild(bytesSpan);
      div.appendChild(asciiSpan);
      container.appendChild(div);
    }
  }

  /**
   * Render Security & Auditor findings
   */
  static renderAuditReport(audit) {
    const badge = document.getElementById('audit-badge');
    const container = document.getElementById('audit-findings-list');
    container.innerHTML = '';

    if (audit.passed) {
      badge.className = 'finding-badge pass';
      badge.textContent = 'PASS';
    } else {
      badge.className = 'finding-badge fail';
      badge.textContent = 'FAIL';
    }

    for (const f of audit.findings) {
      const card = document.createElement('div');
      card.className = 'finding-card';
      const badgeClass = f.severity === 'PASS' ? 'pass' : (f.severity === 'WARN' ? 'warn' : 'fail');
      const offsetInfo = f.offset !== undefined ? ` @ ${BinaryReader.toHex(f.offset)}` : '';

      card.innerHTML = `
        <span class="finding-badge ${badgeClass}">${f.severity}</span>
        <div style="flex: 1;">
          <div style="font-weight: 700; font-size: 0.82rem; font-family: var(--font-mono); color: #fff;">${f.rule}${offsetInfo}</div>
          <div style="font-size: 0.78rem; color: var(--text-muted);">${f.message}</div>
        </div>
      `;
      container.appendChild(card);
    }
  }
}
