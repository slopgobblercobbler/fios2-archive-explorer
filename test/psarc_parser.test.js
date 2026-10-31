import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { PsarcParser } from '../js/psarc_parser.js';
import { createSample1PsarcOodle } from '../js/samples.js';

describe('PsarcParser', () => {
  it('should parse valid PSARC archive header and entries', () => {
    const raw = createSample1PsarcOodle();
    const parser = new PsarcParser(raw);
    const result = parser.parse();

    assert.equal(result.type, 'PSARC');
    assert.equal(result.header.magic, 'PSAR');
    assert.equal(result.header.version, '1.4');
    assert.equal(result.header.compression, 'oodl');
    assert.equal(result.header.blockSize, 65536);
    assert.equal(result.header.tocEntriesCount, 4);

    // Entry 0 is manifest
    assert.equal(result.entries[0].isManifest, true);

    // Entries 1..3
    assert.equal(result.totalFiles, 3);
    assert.equal(result.entries[1].path, '/app0/eboot.bin');
    assert.equal(result.entries[2].path, '/app0/media/shaders.sb');
    assert.equal(result.entries[3].path, '/app0/data/audio/bgm.vag');

    // Check size calculations
    assert.equal(result.entries[1].uncompressedSize, 131072);
    assert.equal(result.entries[1].chunks.length, 2);
    assert.ok(result.totalCompressedBytes < result.totalUncompressedBytes);
    assert.ok(parseFloat(result.overallSavingsPercent) > 0);
  });

  it('should reject archives smaller than minimum 32-byte header', () => {
    const smallBuffer = new Uint8Array(16);
    const parser = new PsarcParser(smallBuffer);
    assert.throws(() => parser.parse(), /Invalid archive size/);
  });

  it('should reject invalid magic header signature', () => {
    const raw = new Uint8Array(64);
    raw.set([0x46, 0x41, 0x49, 0x4C], 0); // 'FAIL'
    const parser = new PsarcParser(raw);
    assert.throws(() => parser.parse(), /Invalid PSARC Magic Header/);
  });
});
