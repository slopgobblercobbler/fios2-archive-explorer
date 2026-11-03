import assert from 'assert';
import schema from '../src/archive_schema.json' assert { type: 'json' };

describe('Fios2 Archive Magic', () => {
    it('should verify standard superblock magic', () => {
        assert.strictEqual(schema.MAGIC, 'FIOS2_ARC_V1');
    });

    it('should have standard 4096 block alignment', () => {
        assert.strictEqual(schema.BLOCK_SIZE, 4096);
    });
});
