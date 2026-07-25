const test = require('node:test');
const assert = require('node:assert/strict');
const { gitCommit } = require('../gitUtils');

test('gitCommit refuses to run without an explicit, non-empty pathspec — never a bare `git commit`', () => {
  // This repository's own index can (and, during this feature's own rollout, did) hold unrelated
  // staged changes from other work at the moment a merge runs. A bare `git commit` would sweep
  // those into the automation-merge commit. gitCommit must always be pathspec-scoped.
  assert.throws(() => gitCommit('msg', [], { execFileSync: () => { throw new Error('must not be invoked'); } }));
  assert.throws(() => gitCommit('msg', undefined, { execFileSync: () => { throw new Error('must not be invoked'); } }));
});

test('gitCommit passes a trailing pathspec after `--`, restricting the commit to those paths', () => {
  const calls = [];
  gitCommit('msg', ['a/b.txt', 'a/c.txt'], { execFileSync: (cmd, args) => { calls.push(args); return ''; } });
  assert.deepEqual(calls, [['commit', '-m', 'msg', '--', 'a/b.txt', 'a/c.txt']]);
});
