const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');

const { detectStack, isMaterial, normalizeVersion } = require('../detectStack');

function makeProject(files) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'stack-docs-'));
  for (const [relative, content] of Object.entries(files)) {
    const full = path.join(root, relative);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, content, 'utf8');
  }
  return root;
}

test('normalizeVersion distinguishes a pinned version from a range', () => {
  assert.deepStrictEqual(normalizeVersion('1.61.1'), { version: '1.61.1', pinned: true });
  assert.deepStrictEqual(normalizeVersion('^1.61.1'), { version: '1.61.1', pinned: false });
  assert.deepStrictEqual(normalizeVersion('>=2.0,<3'), { version: '2.0', pinned: false });
  assert.deepStrictEqual(normalizeVersion(undefined), { version: 'unknown', pinned: false });
});

test('isMaterial keeps test-facing libraries and drops unrelated ones', () => {
  assert.ok(isMaterial('@playwright/test'));
  assert.ok(isMaterial('allure-testng'));
  assert.ok(isMaterial('pytest-bdd'));
  assert.ok(!isMaterial('webpack'));
  assert.ok(!isMaterial('eslint-plugin-import'));
});

test('the lockfile version overrides the manifest range for the same library', () => {
  const root = makeProject({
    'package.json': JSON.stringify({
      devDependencies: { '@playwright/test': '^1.61.0', webpack: '^5.0.0' },
    }),
    'package-lock.json': JSON.stringify({
      lockfileVersion: 3,
      packages: {
        'node_modules/@playwright/test': { version: '1.61.1' },
        'node_modules/webpack': { version: '5.94.0' },
      },
    }),
  });

  const stack = detectStack(root);
  const playwright = stack.dependencies.find((d) => d.library === '@playwright/test');

  assert.ok(playwright, 'playwright should be detected');
  assert.strictEqual(playwright.version, '1.61.1');
  assert.strictEqual(playwright.pinned, true);
  assert.match(playwright.source, /package-lock\.json/);
  assert.strictEqual(stack.unpinned.length, 0);
  // webpack is not material, so it must not reach the query plan.
  assert.ok(!stack.dependencies.some((d) => d.library === 'webpack'));
});

test('a manifest-only project reports its dependency as unpinned', () => {
  const root = makeProject({
    'package.json': JSON.stringify({ devDependencies: { playwright: '^1.61.1' } }),
  });

  const stack = detectStack(root);
  const dep = stack.dependencies.find((d) => d.library === 'playwright');

  assert.strictEqual(dep.version, '1.61.1');
  assert.strictEqual(dep.pinned, false);
  assert.deepStrictEqual(stack.unpinned, ['playwright']);
});

test('pom.xml dependencies resolve ${property} versions', () => {
  const root = makeProject({
    'pom.xml': `<project>
      <properties><shaft.version>9.2.20250101</shaft.version></properties>
      <dependencies>
        <dependency>
          <groupId>io.github.shafthq</groupId>
          <artifactId>SHAFT_ENGINE</artifactId>
          <version>\${shaft.version}</version>
        </dependency>
        <dependency>
          <groupId>org.testng</groupId>
          <artifactId>testng</artifactId>
          <version>7.10.2</version>
        </dependency>
      </dependencies>
    </project>`,
  });

  const stack = detectStack(root);
  const shaft = stack.dependencies.find((d) => d.library === 'SHAFT_ENGINE');
  const testng = stack.dependencies.find((d) => d.library === 'testng');

  assert.strictEqual(shaft.version, '9.2.20250101');
  assert.strictEqual(shaft.group, 'io.github.shafthq');
  assert.strictEqual(testng.version, '7.10.2');
  assert.strictEqual(stack.ecosystems.includes('maven'), true);
});

test('framework config files are detected independently of manifests', () => {
  const root = makeProject({
    'playwright.config.ts': 'export default {};',
    'testng.xml': '<suite name="s"/>',
    'src/main/resources/properties/TestNG.properties': 'x=y',
  });

  const stack = detectStack(root);
  assert.ok(stack.frameworks.includes('Playwright'));
  assert.ok(stack.frameworks.includes('TestNG'));
  assert.ok(stack.frameworks.includes('SHAFT'));
});

test('vendored and build directories are not walked', () => {
  const root = makeProject({
    'package.json': JSON.stringify({ devDependencies: { playwright: '1.61.1' } }),
    'node_modules/selenium-webdriver/package.json': JSON.stringify({
      dependencies: { 'selenium-webdriver': '4.0.0' },
    }),
    'target/pom.xml': '<project><dependencies><dependency><artifactId>junit</artifactId><version>5.0.0</version></dependency></dependencies></project>',
  });

  const stack = detectStack(root);
  assert.ok(!stack.sources.some((s) => s.includes('node_modules')));
  assert.ok(!stack.sources.some((s) => s.includes('target/')));
  assert.ok(!stack.dependencies.some((d) => d.library === 'junit'));
});

test('requirements.txt pins with == and flags inequality ranges', () => {
  const root = makeProject({
    'requirements.txt': '# comment\npytest==8.3.2\nrequests>=2.30\n-r other.txt\n',
  });

  const stack = detectStack(root);
  const pytest = stack.dependencies.find((d) => d.library === 'pytest');
  const requests = stack.dependencies.find((d) => d.library === 'requests');

  assert.deepStrictEqual([pytest.version, pytest.pinned], ['8.3.2', true]);
  assert.strictEqual(requests.pinned, false);
});

test('an empty project yields an empty, non-throwing result', () => {
  const root = makeProject({ 'README.md': '# nothing here' });
  const stack = detectStack(root);

  assert.deepStrictEqual(stack.dependencies, []);
  assert.deepStrictEqual(stack.ecosystems, []);
  assert.deepStrictEqual(stack.sources, []);
});
