import {
  SCE_FIOS_ERRORS,
  FIOS2_MOUNT_ORDERS
} from './fios2_constants.js';

/**
 * OverlaySimulator - libSceFios2 Overlay Mount & Filesystem Resolution Engine
 * Emulates sceFiosOverlayAdd, sceFiosOverlayResolveSync, path normalization, and buffer validation.
 */
export class OverlaySimulator {
  constructor() {
    /** @type {Array<{ mountPoint: string, name: string, order: number, files: Map<string, Object> }>} */
    this.overlays = [];
  }

  /**
   * Reset all mounted overlays
   */
  clear() {
    this.overlays = [];
  }

  /**
   * Normalize POSIX path according to libSceFios2 invariants
   * Collapses multiple slashes, resolves '.', and rejects '../' escaping root.
   * @param {string} rawPath
   * @returns {{ normalized: string, error?: number, errorMsg?: string }}
   */
  static normalizePath(rawPath) {
    if (typeof rawPath !== 'string' || rawPath.trim() === '') {
      return {
        normalized: '',
        error: 0x80540001, // SCE_FIOS_ERROR_INVALID_ARGUMENT
        errorMsg: 'Invalid empty or non-string path provided'
      };
    }

    let p = rawPath.trim();
    // Normalize backslashes to forward slashes
    p = p.replace(/\\/g, '/');

    // Security check: detect null bytes or control characters
    if (/[\0\x01-\x1f]/.test(p)) {
      return {
        normalized: '',
        error: 0x80540001,
        errorMsg: 'Null byte or forbidden control characters detected'
      };
    }

    // Split components
    const rawSegments = p.split('/');
    const resolvedSegments = [];

    const isAbsolute = p.startsWith('/');

    for (const segment of rawSegments) {
      if (segment === '' || segment === '.') {
        continue;
      }
      if (segment === '..') {
        if (resolvedSegments.length === 0) {
          // Attempting to traverse above root boundary
          return {
            normalized: '',
            error: 0x8054001f, // SCE_FIOS_ERROR_PATH_TRAVERSAL
            errorMsg: `Path traversal violation: attempted to escape root via "${rawPath}"`
          };
        }
        resolvedSegments.pop();
      } else {
        resolvedSegments.push(segment);
      }
    }

    let result = (isAbsolute ? '/' : '') + resolvedSegments.join('/');
    if (result === '') result = '/';

    return { normalized: result };
  }

  /**
   * Mount a filesystem overlay (sceFiosOverlayAdd)
   * @param {string} mountPoint e.g. "/app0"
   * @param {string} name e.g. "Base Disc v1.00"
   * @param {number} order Priority (higher order takes precedence, e.g. 100 > 0)
   * @param {Array<Object>|Map<string, Object>} files List of file descriptors
   */
  addOverlay(mountPoint, name, order, files) {
    const normMount = OverlaySimulator.normalizePath(mountPoint).normalized || mountPoint;
    const fileMap = new Map();

    if (files instanceof Map) {
      for (const [k, v] of files.entries()) {
        const normK = OverlaySimulator.normalizePath(k).normalized || k;
        fileMap.set(normK, v);
      }
    } else if (Array.isArray(files)) {
      for (const f of files) {
        const normK = OverlaySimulator.normalizePath(f.path).normalized || f.path;
        fileMap.set(normK, f);
      }
    }

    // Remove existing overlay with same name if already present
    this.removeOverlay(name);

    this.overlays.push({
      mountPoint: normMount,
      name,
      order: Number(order),
      files: fileMap
    });

    // Sort descending by order (highest order evaluated first)
    this.overlays.sort((a, b) => b.order - a.order);
  }

  /**
   * Remove an overlay by name
   */
  removeOverlay(name) {
    this.overlays = this.overlays.filter(o => o.name !== name);
  }

  /**
   * Get all active overlays
   */
  getOverlays() {
    return [...this.overlays];
  }

  /**
   * Resolve a virtual path through the overlay stack (sceFiosOverlayResolveSync)
   * @param {string} rawPath
   * @param {number} [requestedBufferSize=0] Destination buffer size for decompression check
   */
  resolve(rawPath, requestedBufferSize = 0) {
    const trace = [];
    trace.push(`[1] Input Path: "${rawPath}"`);

    // 1. Normalize Path
    const norm = OverlaySimulator.normalizePath(rawPath);
    if (norm.error) {
      trace.push(`[FAIL] Normalization Error: ${norm.errorMsg}`);
      return {
        status: 'ERROR',
        errorCode: norm.error,
        errorInfo: SCE_FIOS_ERRORS[norm.error],
        path: rawPath,
        normalizedPath: '',
        trace
      };
    }

    const path = norm.normalized;
    trace.push(`[2] Normalized Path: "${path}"`);

    if (this.overlays.length === 0) {
      trace.push('[FAIL] No overlays currently mounted.');
      return {
        status: 'ERROR',
        errorCode: 0x8054000e, // SCE_FIOS_ERROR_NOT_MOUNTED
        errorInfo: SCE_FIOS_ERRORS[0x8054000e],
        path: rawPath,
        normalizedPath: path,
        trace
      };
    }

    // 2. Iterate overlays by order descending
    trace.push(`[3] Searching ${this.overlays.length} active overlay layer(s) sorted by priority:`);
    let matchedFile = null;
    let matchedLayer = null;

    for (const layer of this.overlays) {
      trace.push(`   - Inspecting Layer "${layer.name}" (Order ${layer.order}, Mount "${layer.mountPoint}")`);

      // Check if path falls under this mount point
      if (!path.startsWith(layer.mountPoint)) {
        trace.push(`     Skipped: path does not start with mount point "${layer.mountPoint}"`);
        continue;
      }

      if (layer.files.has(path)) {
        matchedFile = layer.files.get(path);
        matchedLayer = layer;
        trace.push(`     ✓ HIT! File found in layer "${layer.name}" with size ${matchedFile.uncompressedSize || matchedFile.size || 0} bytes`);
        break;
      } else {
        trace.push(`     Miss: file not found in this layer`);
      }
    }

    if (!matchedFile) {
      trace.push(`[FAIL] File "${path}" was not found in any mounted overlay layer.`);
      return {
        status: 'ERROR',
        errorCode: 0x80540002, // SCE_FIOS_ERROR_FILE_NOT_FOUND
        errorInfo: SCE_FIOS_ERRORS[0x80540002],
        path: rawPath,
        normalizedPath: path,
        trace
      };
    }

    // 3. Decompression Buffer Validation
    const uncompressedSize = matchedFile.uncompressedSize || matchedFile.size || 0;
    const requiredChunkBuffer = matchedFile.requiredBufferSize || Math.min(uncompressedSize, 65536);

    trace.push(`[4] Verifying destination decompressor buffer allocation:`);
    trace.push(`   - Required Buffer: ${requiredChunkBuffer} bytes (Uncompressed total: ${uncompressedSize} bytes)`);
    trace.push(`   - Provided Buffer: ${requestedBufferSize} bytes`);

    if (requestedBufferSize > 0 && requestedBufferSize < requiredChunkBuffer) {
      trace.push(`[FAIL] Buffer allocation fault: Destination buffer (${requestedBufferSize} B) < Required (${requiredChunkBuffer} B)`);
      return {
        status: 'ERROR',
        errorCode: 0x80540010, // SCE_FIOS_ERROR_BUFFER_TOO_SMALL
        errorInfo: SCE_FIOS_ERRORS[0x80540010],
        path: rawPath,
        normalizedPath: path,
        matchedLayer: { name: matchedLayer.name, order: matchedLayer.order, mountPoint: matchedLayer.mountPoint },
        file: matchedFile,
        trace
      };
    }

    trace.push(`[SUCCESS] Path resolved successfully! Assigned SceFiosFH file handle.`);
    return {
      status: 'OK',
      errorCode: 0,
      errorInfo: SCE_FIOS_ERRORS[0],
      path: rawPath,
      normalizedPath: path,
      matchedLayer: {
        name: matchedLayer.name,
        order: matchedLayer.order,
        mountPoint: matchedLayer.mountPoint
      },
      file: matchedFile,
      uncompressedSize,
      trace
    };
  }
}
