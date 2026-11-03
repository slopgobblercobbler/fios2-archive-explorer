import assert from 'assert';
import flags from '../src/mount_flags.json' assert { type: 'json' };

describe('Mount Flags', () => {
    it('should define read-only and overlay modes', () => {
        assert.strictEqual(flags.SCE_FIOS_MOUNT_READONLY, 1);
        assert.strictEqual(flags.SCE_FIOS_MOUNT_OVERLAY, 2);
    });
});
