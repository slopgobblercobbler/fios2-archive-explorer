import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Fios2Auditor } from '../js/fios2_auditor.js';
import { PsarcParser } from '../js/psarc_parser.js';
import { PfsParser } from '../js/pfs_parser.js';
import {
  createSample1PsarcOodle,
  createSample2PfsContainer,
  createSample4CorruptedArchive
} from '../js/samples.js';

describe('Fios2Auditor', () => {
  it('should pass audit for authentic PSARC archive', () => {
    const raw = createSample1PsarcOodle();
    const parser = new PsarcParser(raw);
    const parsed = parser.parse();

    const audit = Fios2Auditor.audit(parsed, raw);
    assert.equal(audit.passed, true);
    assert.ok(audit.findings.length >= 5);
    assert.ok(audit.findings.every(f => f.severity === 'PASS'));
  });

  it('should pass audit for authentic PFS image', () => {
    const raw = createSample2PfsContainer();
    const parser = new PfsParser(raw);
    const parsed = parser.parse();

    const audit = Fios2Auditor.audit(parsed, raw);
    assert.equal(audit.passed, true);
    assert.ok(audit.findings.some(f => f.rule === 'RULE_PFS_SUPERBLOCK_MAGIC' && f.severity === 'PASS'));
  });

  it('should detect violations in corrupted archive', () => {
    const corruptRaw = createSample4CorruptedArchive();

    // Mock parsed structure with corrupted parameters
    const mockCorruptParsed = {
      type: 'PSARC',
      header: {
        magic: 'BAD!',
        version: '9.9',
        versionMajor: 9,
        versionMinor: 9,
        compression: 'XXXX',
        compressionName: 'Unknown',
        tocOffset: 0x8000, // Out of bounds
        tocEntrySize: 30,
        tocEntriesCount: 5
      },
      entries: [
        {
          index: 0,
          tocOffset: 0x8000,
          path: '../../etc/shadow',
          uncompressedSize: 100,
          compressedSize: 50,
          dataOffset: 0x9000
        }
      ]
    };

    const audit = Fios2Auditor.audit(mockCorruptParsed, corruptRaw);
    assert.equal(audit.passed, false);

    const failRules = audit.findings.filter(f => f.severity === 'FAIL').map(f => f.rule);
    assert.ok(failRules.includes('RULE_PSARC_MAGIC'));
    assert.ok(failRules.includes('RULE_COMPRESSION_FOURCC'));
    assert.ok(failRules.includes('RULE_TOC_BOUNDARIES'));
    assert.ok(failRules.includes('RULE_PATH_TRAVERSAL'));
    assert.ok(failRules.includes('RULE_DATA_OFFSET_BOUNDS'));
  });
});
