import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { OverlaySimulator } from '../js/overlay_simulator.js';
import { createSample3OverlayConfig } from '../js/samples.js';

describe('OverlaySimulator', () => {
  it('should normalize paths according to POSIX and libSceFios2 rules', () => {
    assert.equal(OverlaySimulator.normalizePath('//app0//./data///test.txt').normalized, '/app0/data/test.txt');
    assert.equal(OverlaySimulator.normalizePath('/app0/dir/../file.bin').normalized, '/app0/file.bin');
    assert.equal(OverlaySimulator.normalizePath('app0/sub/').normalized, 'app0/sub');
    assert.equal(OverlaySimulator.normalizePath('/').normalized, '/');
  });

  it('should reject path traversal escaping root boundary', () => {
    const res1 = OverlaySimulator.normalizePath('../../secret.txt');
    assert.equal(res1.error, 0x8054001f); // SCE_FIOS_ERROR_PATH_TRAVERSAL

    const res2 = OverlaySimulator.normalizePath('/app0/../../outside.dat');
    assert.equal(res2.error, 0x8054001f);
  });

  it('should reject empty or null-byte paths with INVALID_ARGUMENT', () => {
    const res1 = OverlaySimulator.normalizePath('');
    assert.equal(res1.error, 0x80540001);

    const res2 = OverlaySimulator.normalizePath('/app0/evil\0file');
    assert.equal(res2.error, 0x80540001);
  });

  it('should resolve overlay layers with mount order priority', () => {
    const sim = new OverlaySimulator();
    const config = createSample3OverlayConfig();

    for (const c of config) {
      sim.addOverlay(c.mountPoint, c.name, c.order, c.files);
    }

    // Resolving /app0/eboot.bin must hit Layer 1 (Patch v1.05, order 100) instead of Layer 0 (Base, order 0)
    const resolveEboot = sim.resolve('/app0/eboot.bin');
    assert.equal(resolveEboot.status, 'OK');
    assert.equal(resolveEboot.matchedLayer.order, 100);
    assert.ok(resolveEboot.matchedLayer.name.includes('Patch'));

    // Resolving /app0/media/common.pak exists only in Layer 0
    const resolveCommon = sim.resolve('/app0/media/common.pak');
    assert.equal(resolveCommon.status, 'OK');
    assert.equal(resolveCommon.matchedLayer.order, 0);

    // Resolving /app0/dlc/expansion1.pak exists in Layer 2 (DLC, order 200)
    const resolveDlc = sim.resolve('/app0/dlc/expansion1.pak');
    assert.equal(resolveDlc.status, 'OK');
    assert.equal(resolveDlc.matchedLayer.order, 200);

    // Resolving non-existent file returns SCE_FIOS_ERROR_FILE_NOT_FOUND
    const resolveMissing = sim.resolve('/app0/missing.dat');
    assert.equal(resolveMissing.status, 'ERROR');
    assert.equal(resolveMissing.errorCode, 0x80540002);
  });

  it('should reject undersized destination decompression buffers', () => {
    const sim = new OverlaySimulator();
    sim.addOverlay('/app0', 'Base', 0, [
      { path: '/app0/large.dat', uncompressedSize: 1048576, requiredBufferSize: 65536 }
    ]);

    // Requesting buffer of 1024 bytes when required is 65536 bytes
    const res = sim.resolve('/app0/large.dat', 1024);
    assert.equal(res.status, 'ERROR');
    assert.equal(res.errorCode, 0x80540010); // SCE_FIOS_ERROR_BUFFER_TOO_SMALL
  });
});
