import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { PfsParser } from '../js/pfs_parser.js';
import { createSample2PfsContainer } from '../js/samples.js';

describe('PfsParser', () => {
  it('should identify and parse valid PFS superblock and inodes', () => {
    const raw = createSample2PfsContainer();
    assert.equal(PfsParser.isPfs(raw), true);

    const parser = new PfsParser(raw);
    const result = parser.parse();

    assert.equal(result.type, 'PFS');
    assert.equal(result.superblock.version, 2);
    assert.equal(result.superblock.blockSize, 4096);
    assert.equal(result.superblock.blockCount, 16);
    assert.equal(result.superblock.titleId, 'PPSA01942-GAME00');
    assert.equal(result.superblock.modeDecoded.readOnly, true);
    assert.equal(result.superblock.modeDecoded.encrypted, true);

    assert.equal(result.inodes.length, 4);
    assert.equal(result.inodes[0].inodeNum, 1);
    assert.equal(result.inodes[0].isDir, true);

    // Dirents
    assert.ok(result.dirents.length >= 2);
    const ebootDirent = result.dirents.find(d => d.name === 'eboot.bin');
    assert.ok(ebootDirent);
    assert.equal(ebootDirent.targetInode, 4);
  });

  it('should reject invalid PFS magic header', () => {
    const invalidBuffer = new Uint8Array(128);
    const parser = new PfsParser(invalidBuffer);
    assert.throws(() => parser.parse(), /Invalid PFS Superblock Magic/);
  });
});
