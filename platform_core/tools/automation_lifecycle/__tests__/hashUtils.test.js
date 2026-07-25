const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { hashContent, walkFiles } = require('../hashUtils');

test('hashContent is deterministic for identical content', () => {
  assert.equal(hashContent('hello'), hashContent('hello'));
  assert.equal(hashContent(Buffer.from('hello')), hashContent('hello'));
});

test('hashContent differs for different content', () => {
  assert.notEqual(hashContent('hello'), hashContent('world'));
});

test('walkFiles returns [] for a directory that does not exist', () => {
  assert.deepEqual(walkFiles(path.join(os.tmpdir(), 'definitely-does-not-exist-xyz')), []);
});

test('walkFiles recursively lists files, skipping .git', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'hashutils-'));
  try {
    fs.mkdirSync(path.join(dir, '.git'));
    fs.writeFileSync(path.join(dir, '.git', 'HEAD'), 'ref: refs/heads/main');
    fs.mkdirSync(path.join(dir, 'src'));
    fs.writeFileSync(path.join(dir, 'src', 'a.js'), 'a');
    fs.writeFileSync(path.join(dir, 'b.js'), 'b');

    const files = walkFiles(dir).map((f) => path.relative(dir, f).split(path.sep).join('/')).sort();
    assert.deepEqual(files, ['b.js', 'src/a.js']);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
