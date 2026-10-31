import {
  PSARC_MAGIC_STR,
  COMPRESSION_FOURCC,
  PFS_SUPERBLOCK_MAGIC_V1,
  PFS_SUPERBLOCK_MAGIC_V2,
  PFS_SUPERBLOCK_MAGIC_V3
} from './fios2_constants.js';
import { BinaryReader } from './binary_reader.js';

/**
 * FIOS2 Integrity & Security Auditor
 * Audits archive containers, headers, offsets, chunk boundaries, and path traversal vectors.
 */
export class Fios2Auditor {
  /**
   * Audit a parsed archive or raw buffer
   * @param {Object} parsed Parsed PSARC or PFS object
   * @param {Uint8Array} rawBytes Raw buffer bytes
   * @returns {{ passed: boolean, findings: Array<{ severity: 'PASS'|'WARN'|'FAIL', rule: string, message: string, offset?: number }> }}
   */
  static audit(parsed, rawBytes) {
    const findings = [];
    let hasFailures = false;

    if (!parsed || !rawBytes) {
      return {
        passed: false,
        findings: [{
          severity: 'FAIL',
          rule: 'INPUT_VALIDATION',
          message: 'No archive data supplied for audit'
        }]
      };
    }

    if (parsed.type === 'PSARC') {
      const h = parsed.header;

      // Rule 1: Header Magic Check
      if (h.magic === PSARC_MAGIC_STR) {
        findings.push({
          severity: 'PASS',
          rule: 'RULE_PSARC_MAGIC',
          message: `Valid PSARC 4-byte Magic signature (0x50534152)`,
          offset: 0
        });
      } else {
        hasFailures = true;
        findings.push({
          severity: 'FAIL',
          rule: 'RULE_PSARC_MAGIC',
          message: `Invalid PSARC Magic "${h.magic}". Expected "PSAR"`,
          offset: 0
        });
      }

      // Rule 2: Version Validation
      if (h.versionMajor === 1 && (h.versionMinor === 4 || h.versionMinor === 3 || h.versionMinor === 0)) {
        findings.push({
          severity: 'PASS',
          rule: 'RULE_PSARC_VERSION',
          message: `Standard FIOS2 PSARC specification version ${h.version}`,
          offset: 4
        });
      } else {
        findings.push({
          severity: 'WARN',
          rule: 'RULE_PSARC_VERSION',
          message: `Non-standard PSARC version: ${h.version}`,
          offset: 4
        });
      }

      // Rule 3: Compression Algorithm Check
      const validFourCCs = Object.values(COMPRESSION_FOURCC);
      if (validFourCCs.includes(h.compression)) {
        findings.push({
          severity: 'PASS',
          rule: 'RULE_COMPRESSION_FOURCC',
          message: `Valid libSceFios2 compression algorithm: "${h.compression}" (${h.compressionName})`,
          offset: 8
        });
      } else {
        findings.push({
          severity: 'FAIL',
          rule: 'RULE_COMPRESSION_FOURCC',
          message: `Unrecognized compression FourCC "${h.compression}". Decompressor may abort with SCE_FIOS_ERROR_DECOMPRESS_FAILED`,
          offset: 8
        });
        hasFailures = true;
      }

      // Rule 4: TOC Offset and Boundary Checks
      const tocEnd = h.tocOffset + (h.tocEntriesCount * h.tocEntrySize);
      if (h.tocOffset >= 32 && tocEnd <= rawBytes.length) {
        findings.push({
          severity: 'PASS',
          rule: 'RULE_TOC_BOUNDARIES',
          message: `TOC boundaries valid: [0x${h.tocOffset.toString(16)} - 0x${tocEnd.toString(16)}] (${h.tocEntriesCount} entries)`,
          offset: 12
        });
      } else {
        hasFailures = true;
        findings.push({
          severity: 'FAIL',
          rule: 'RULE_TOC_BOUNDARIES',
          message: `TOC range 0x${tocEnd.toString(16)} exceeds total archive size 0x${rawBytes.length.toString(16)}`,
          offset: 12
        });
      }

      // Rule 5: File Entry Offsets & Path Sanitization
      let traversalDetected = false;
      let offsetOverflow = false;

      for (const entry of parsed.entries) {
        // Path Traversal check
        if (entry.path.includes('../') || entry.path.includes('..\\') || entry.path.startsWith('..')) {
          traversalDetected = true;
          hasFailures = true;
          findings.push({
            severity: 'FAIL',
            rule: 'RULE_PATH_TRAVERSAL',
            message: `Security violation in entry ${entry.index}: Relative path traversal attempt detected in "${entry.path}"`,
            offset: entry.tocOffset
          });
        }

        // Data offset check
        const entryEnd = entry.dataOffset + entry.compressedSize;
        if (entry.dataOffset > rawBytes.length || entryEnd > rawBytes.length) {
          offsetOverflow = true;
          hasFailures = true;
          findings.push({
            severity: 'FAIL',
            rule: 'RULE_DATA_OFFSET_BOUNDS',
            message: `Entry ${entry.index} ("${entry.path}") data range [0x${entry.dataOffset.toString(16)} - 0x${entryEnd.toString(16)}] exceeds EOF 0x${rawBytes.length.toString(16)}`,
            offset: entry.tocOffset
          });
        }
      }

      if (!traversalDetected) {
        findings.push({
          severity: 'PASS',
          rule: 'RULE_PATH_TRAVERSAL',
          message: `All ${parsed.entries.length} entry paths strictly conform to root namespace boundaries without relative traversal`
        });
      }

      if (!offsetOverflow) {
        findings.push({
          severity: 'PASS',
          rule: 'RULE_DATA_OFFSET_BOUNDS',
          message: `All file payload chunks are securely contained within archive boundary`
        });
      }

      // Rule 6: Decompression Buffer Ratio Check (Zip-bomb defense)
      const maxRatio = parsed.entries.reduce((max, e) => {
        const ratio = e.compressedSize > 0 ? e.uncompressedSize / e.compressedSize : 1;
        return ratio > max ? ratio : max;
      }, 0);

      if (maxRatio > 1000) {
        findings.push({
          severity: 'WARN',
          rule: 'RULE_COMPRESSION_RATIO',
          message: `Anomalously high compression ratio (${maxRatio.toFixed(1)}:1) detected. Potential decompression memory bomb`
        });
      } else {
        findings.push({
          severity: 'PASS',
          rule: 'RULE_COMPRESSION_RATIO',
          message: `Decompression expansion ratios are within safe operational limits (max ${maxRatio.toFixed(1)}:1)`
        });
      }

    } else if (parsed.type === 'PFS') {
      const sb = parsed.superblock;

      // PFS Superblock Validation
      if ([PFS_SUPERBLOCK_MAGIC_V1, PFS_SUPERBLOCK_MAGIC_V2, PFS_SUPERBLOCK_MAGIC_V3].includes(sb.magicDecimal) || sb.magic.includes('504653')) {
        findings.push({
          severity: 'PASS',
          rule: 'RULE_PFS_SUPERBLOCK_MAGIC',
          message: `Valid PlayStation PFS Superblock Magic (${sb.magic})`,
          offset: 0
        });
      } else {
        hasFailures = true;
        findings.push({
          severity: 'FAIL',
          rule: 'RULE_PFS_SUPERBLOCK_MAGIC',
          message: `Invalid PFS Superblock Magic (${sb.magic})`,
          offset: 0
        });
      }

      // Block size check
      if (sb.blockSize === 4096 || sb.blockSize === 65536) {
        findings.push({
          severity: 'PASS',
          rule: 'RULE_PFS_BLOCK_SIZE',
          message: `Standard PFS block alignment: ${sb.blockSize} bytes`,
          offset: 8
        });
      } else {
        findings.push({
          severity: 'WARN',
          rule: 'RULE_PFS_BLOCK_SIZE',
          message: `Non-standard PFS block size: ${sb.blockSize} bytes`,
          offset: 8
        });
      }

      // Inode allocation check
      if (sb.inodeCount > 0 && sb.rootInodeIndex <= sb.inodeCount) {
        findings.push({
          severity: 'PASS',
          rule: 'RULE_PFS_ROOT_INODE',
          message: `Root directory inode #${sb.rootInodeIndex} within allocated inode pool (${sb.inodeCount} inodes)`
        });
      } else {
        hasFailures = true;
        findings.push({
          severity: 'FAIL',
          rule: 'RULE_PFS_ROOT_INODE',
          message: `Root inode #${sb.rootInodeIndex} invalid or out of range for ${sb.inodeCount} inodes`
        });
      }
    }

    return {
      passed: !hasFailures,
      findings
    };
  }
}
