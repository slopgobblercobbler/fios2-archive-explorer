import { BinaryReader } from './binary_reader.js';
import { PsarcParser } from './psarc_parser.js';
import { PfsParser } from './pfs_parser.js';
import { OverlaySimulator } from './overlay_simulator.js';
import { Fios2Auditor } from './fios2_auditor.js';
import { UI } from './ui.js';
import {
  createSample1PsarcOodle,
  createSample2PfsContainer,
  createSample3OverlayConfig,
  createSample4CorruptedArchive
} from './samples.js';

class App {
  constructor() {
    this.rawBytes = null;
    this.parsed = null;
    this.audit = null;
    this.simulator = new OverlaySimulator();

    // Hex Viewer State
    this.hexOffset = 0;
    this.hexPageSize = 512;
    this.highlightRange = null;

    this.selectedEntry = null;
  }

  init() {
    this.bindEvents();
    // Load default Sample 1
    this.loadPreset('SAMPLE_1_PSARC_OODLE');
  }

  bindEvents() {
    // Tab switching
    document.querySelectorAll('.nav-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        const targetId = e.currentTarget.getAttribute('data-target');
        this.switchTab(targetId);
      });
    });

    // Input mode switching (File vs Hex)
    document.querySelectorAll('.input-tab').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.input-tab').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        const mode = e.currentTarget.getAttribute('data-input-mode');
        document.getElementById('dropzone-container').style.display = mode === 'file' ? 'block' : 'none';
        document.getElementById('hex-input-container').style.display = mode === 'hex' ? 'flex' : 'none';
      });
    });

    // File Dropzone
    const dropzone = document.getElementById('dropzone');
    const fileInput = document.getElementById('file-input');

    dropzone.addEventListener('click', () => fileInput.click());
    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.classList.add('dragover');
    });
    dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
      if (e.dataTransfer.files.length > 0) {
        this.handleFileUpload(e.dataTransfer.files[0]);
      }
    });

    fileInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        this.handleFileUpload(e.target.files[0]);
      }
    });

    // Preset selector & chips
    document.getElementById('btn-load-preset').addEventListener('click', () => {
      const val = document.getElementById('sample-select').value;
      this.loadPreset(val);
    });

    document.querySelectorAll('.chip[data-sample]').forEach(chip => {
      chip.addEventListener('click', (e) => {
        const sampleKey = e.currentTarget.getAttribute('data-sample');
        document.getElementById('sample-select').value = sampleKey;
        this.loadPreset(sampleKey);
      });
    });

    // Hex textarea decode button
    document.getElementById('btn-decode-hex').addEventListener('click', () => {
      this.handleHexTextareaInput();
    });

    // Format & clear buttons
    document.getElementById('btn-clear-hex').addEventListener('click', () => {
      document.getElementById('hex-textarea').value = '';
    });

    document.getElementById('btn-format-hex').addEventListener('click', () => {
      const area = document.getElementById('hex-textarea');
      const clean = area.value.replace(/0x/gi, '').replace(/[^0-9A-Fa-f]/g, '');
      const chunks = clean.match(/.{1,2}/g);
      if (chunks) {
        area.value = chunks.join(' ').toUpperCase();
      }
    });

    // Tree search filter
    document.getElementById('tree-search').addEventListener('input', (e) => {
      if (this.parsed && this.parsed.entries) {
        UI.renderTree(this.parsed.entries, e.target.value, (entry) => this.onSelectFile(entry));
      } else if (this.parsed && this.parsed.fileEntries) {
        UI.renderTree(this.parsed.fileEntries, e.target.value, (entry) => this.onSelectFile(entry));
      }
    });

    // Hex Viewer controls
    document.getElementById('btn-hex-jump').addEventListener('click', () => {
      const val = document.getElementById('hex-jump-offset').value.trim();
      let offset = 0;
      if (val.startsWith('0x') || val.startsWith('0X')) {
        offset = parseInt(val, 16);
      } else {
        offset = parseInt(val, 10);
      }
      if (!isNaN(offset) && offset >= 0) {
        this.jumpToHexOffset(offset);
      }
    });

    document.getElementById('btn-hex-prev').addEventListener('click', () => {
      this.jumpToHexOffset(Math.max(0, this.hexOffset - this.hexPageSize));
    });

    document.getElementById('btn-hex-next').addEventListener('click', () => {
      if (this.rawBytes && this.hexOffset + this.hexPageSize < this.rawBytes.length) {
        this.jumpToHexOffset(this.hexOffset + this.hexPageSize);
      }
    });

    // Overlay Simulator controls
    document.getElementById('btn-resolve-path').addEventListener('click', () => {
      this.executeOverlayResolution();
    });

    document.querySelectorAll('.chip[data-query-path]').forEach(chip => {
      chip.addEventListener('click', (e) => {
        const path = e.currentTarget.getAttribute('data-query-path');
        document.getElementById('overlay-query-path').value = path;
        this.executeOverlayResolution();
      });
    });

    document.getElementById('btn-reset-overlays').addEventListener('click', () => {
      this.setupOverlaySimulatorDefaults();
      UI.renderOverlaySimulator(this.simulator);
      UI.showAlert('Overlay stack reset to multi-layer default configuration.', 'success');
    });

    // Export buttons
    document.getElementById('btn-export-bin').addEventListener('click', () => this.exportBinary());
    document.getElementById('btn-export-json').addEventListener('click', () => this.exportJsonReport());
  }

  switchTab(targetId) {
    document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));

    const tabBtn = document.querySelector(`.nav-tab[data-target="${targetId}"]`);
    const panel = document.getElementById(targetId);

    if (tabBtn) tabBtn.classList.add('active');
    if (panel) panel.classList.add('active');
  }

  loadPreset(presetName) {
    UI.hideAlert();
    try {
      if (presetName === 'SAMPLE_1_PSARC_OODLE') {
        const bytes = createSample1PsarcOodle();
        this.loadBinaryData(bytes, 'ps5_title_update_sample.psarc');
      } else if (presetName === 'SAMPLE_2_PFS_CONTAINER') {
        const bytes = createSample2PfsContainer();
        this.loadBinaryData(bytes, 'ps5_app0_container.pfs');
      } else if (presetName === 'SAMPLE_3_OVERLAY_PRESET') {
        // Setup multi-layer overlay preset and switch to overlay tab
        const bytes = createSample1PsarcOodle();
        this.loadBinaryData(bytes, 'base_disc.psarc');
        this.setupOverlaySimulatorDefaults();
        UI.renderOverlaySimulator(this.simulator);
        this.switchTab('tab-overlay');
        this.executeOverlayResolution();
        UI.showAlert('Multi-layer overlay stack configured with Base Disc, Day-1 Patch, and DLC.', 'success');
      } else if (presetName === 'SAMPLE_4_CORRUPT_ARCHIVE') {
        const bytes = createSample4CorruptedArchive();
        this.loadBinaryData(bytes, 'corrupt_archive_audit_test.bin');
      }
    } catch (err) {
      UI.showAlert(`Preset loading failed: ${err.message}`, 'error');
    }
  }

  handleFileUpload(file) {
    UI.hideAlert();
    const reader = new FileReader();
    reader.onload = (e) => {
      const arrayBuffer = e.target.result;
      this.loadBinaryData(new Uint8Array(arrayBuffer), file.name);
    };
    reader.onerror = () => {
      UI.showAlert('Failed to read uploaded file', 'error');
    };
    reader.readAsArrayBuffer(file);
  }

  handleHexTextareaInput() {
    UI.hideAlert();
    const text = document.getElementById('hex-textarea').value.trim();
    if (!text) {
      UI.showAlert('Please paste hex stream before parsing', 'error');
      return;
    }

    try {
      // Strip formatting: 0x, commas, spaces, brackets
      const clean = text.replace(/0x/gi, '').replace(/[^0-9A-Fa-f]/g, '');
      if (clean.length < 8) {
        throw new Error('Hex stream is too short to be a valid PSARC or PFS header');
      }

      const byteLength = Math.floor(clean.length / 2);
      const bytes = new Uint8Array(byteLength);
      for (let i = 0; i < byteLength; i++) {
        bytes[i] = parseInt(clean.substr(i * 2, 2), 16);
      }

      this.loadBinaryData(bytes, 'pasted_stream.bin');
    } catch (err) {
      UI.showAlert(`Failed to parse hex bytecode: ${err.message}`, 'error');
    }
  }

  loadBinaryData(bytes, sourceName = 'container.bin') {
    this.rawBytes = bytes;
    document.getElementById('file-info-label').textContent = `Loaded: ${sourceName} (${BinaryReader.formatBytes(bytes.length)})`;

    try {
      // Check if PFS container
      if (PfsParser.isPfs(bytes)) {
        const parser = new PfsParser(bytes);
        this.parsed = parser.parse();
      } else {
        // Default to PSARC parser
        const parser = new PsarcParser(bytes);
        this.parsed = parser.parse();
      }

      // Run security auditor
      this.audit = Fios2Auditor.audit(this.parsed, this.rawBytes);
      UI.updateTelemetry(this.parsed, this.audit);

      // Render UI components
      const fileList = this.parsed.entries || this.parsed.fileEntries || [];
      UI.renderTree(fileList, '', (entry) => this.onSelectFile(entry));

      // Select first non-manifest file
      const firstValid = fileList.find(e => !e.isManifest && !e.isDir);
      if (firstValid) {
        this.onSelectFile(firstValid);
      }

      UI.renderHeaderTable(this.parsed);
      UI.renderPartitionMap(this.parsed, (offset, len) => this.jumpToHexOffset(offset, len));
      UI.renderAuditReport(this.audit);

      // Update overlay simulator with loaded files
      this.simulator.clear();
      this.simulator.addOverlay('/app0', 'Current Container Archive', 0, fileList);
      UI.renderOverlaySimulator(this.simulator);

      // Reset Hex Viewer
      this.jumpToHexOffset(0);

    } catch (err) {
      // If parser failed (e.g. Sample 4 corrupted archive), run auditor on raw bytes
      this.parsed = {
        type: 'CORRUPTED',
        totalFiles: 0,
        totalBytes: bytes.length,
        header: {
          magic: 'CORRUPTED',
          version: 'Unknown',
          compression: 'Unknown'
        }
      };

      this.audit = {
        passed: false,
        findings: [{
          severity: 'FAIL',
          rule: 'RULE_HEADER_INTEGRITY',
          message: `Fatal container parse rejection: ${err.message}`,
          offset: 0
        }]
      };

      UI.updateTelemetry(this.parsed, this.audit);
      UI.renderAuditReport(this.audit);
      this.jumpToHexOffset(0);
      UI.showAlert(`Parsing rejection: ${err.message}`, 'error');
    }
  }

  onSelectFile(entry) {
    this.selectedEntry = entry;
    UI.renderFileDetails(entry, (offset, len) => this.jumpToHexOffset(offset, len));
  }

  setupOverlaySimulatorDefaults() {
    this.simulator.clear();
    const config = createSample3OverlayConfig();
    for (const layer of config) {
      this.simulator.addOverlay(layer.mountPoint, layer.name, layer.order, layer.files);
    }
  }

  executeOverlayResolution() {
    const queryPath = document.getElementById('overlay-query-path').value.trim();
    const bufferSize = parseInt(document.getElementById('overlay-buffer-size').value, 10) || 0;

    const result = this.simulator.resolve(queryPath, bufferSize);
    UI.renderResolutionTrace(result);
  }

  jumpToHexOffset(offset, highlightLength = 0) {
    this.hexOffset = offset;
    document.getElementById('hex-jump-offset').value = BinaryReader.toHex(offset);

    if (highlightLength > 0) {
      this.highlightRange = { start: offset, end: offset + highlightLength };
    } else {
      this.highlightRange = null;
    }

    if (this.rawBytes) {
      UI.renderHexViewer(this.rawBytes, this.hexOffset, this.hexPageSize, this.highlightRange);
    }
  }

  exportBinary() {
    if (!this.rawBytes) {
      UI.showAlert('No binary data loaded to export', 'error');
      return;
    }

    const blob = new Blob([this.rawBytes], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = this.parsed ? (this.parsed.type === 'PFS' ? 'container.pfs' : 'archive.psarc') : 'fios2_archive.bin';
    a.click();
    URL.revokeObjectURL(url);
  }

  exportJsonReport() {
    if (!this.parsed) {
      UI.showAlert('No parsed archive report available to export', 'error');
      return;
    }

    const report = {
      meta: {
        tool: 'FIOS2 Archive Explorer',
        version: '1.0.0',
        timestamp: new Date().toISOString()
      },
      parsed: this.parsed,
      audit: this.audit,
      overlays: this.simulator.getOverlays().map(o => ({
        name: o.name,
        mountPoint: o.mountPoint,
        order: o.order,
        fileCount: o.files.size
      }))
    };

    const json = JSON.stringify(report, (k, v) => (typeof v === 'bigint' ? v.toString() : v), 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'fios2_archive_report.json';
    a.click();
    URL.revokeObjectURL(url);
  }
}

// Instantiate and launch
window.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
});
