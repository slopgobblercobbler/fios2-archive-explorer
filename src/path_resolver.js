// Fios2 Canonical Path Resolution and Traversal Defense
export class Fios2PathResolver {
    static sanitize(rawPath) {
        if (!rawPath || typeof rawPath !== 'string') {
            throw new Error('Invalid path argument');
        }
        // Normalize slashes
        let normalized = rawPath.replace(/\\/g, '/');
        // Prevent path traversal
        const segments = normalized.split('/').filter(s => s.length > 0 && s !== '.');
        const resolved = [];
        for (const seg of segments) {
            if (seg === '..') {
                if (resolved.length === 0) {
                    throw new Error('Path traversal attack rejected');
                }
                resolved.pop();
            } else {
                resolved.push(seg);
            }
        }
        return '/' + resolved.join('/');
    }
}
