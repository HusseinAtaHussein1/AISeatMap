// Discovery annotation overlay — the rules that make an annotated screenshot usable evidence.
//
// The overlay builder is pure, so the rule-bearing behaviour is tested here without launching a
// browser: every rectangle carries a label, outlines never fill, cleanup targets exactly one
// container, and the original/annotated filenames pair up. The in-page mechanics that genuinely
// need a DOM are exercised further down against a real Playwright page over a data: URL.

const test = require('node:test');
const assert = require('node:assert/strict');

const {
  OVERLAY_ID,
  ANNOTATED_SUFFIX,
  RECT_COLOR,
  AnnotationError,
  validateRects,
  overlayCss,
  cleanupFunction,
  buildOverlayScript,
  buildCleanupScript,
  buildOverlayPayload,
  annotatedName,
  notCapturableNote,
} = require('../annotate');

// ── Every rectangle maps to a written question ───────────────────────────────────────────────

test('a rectangle without a label is rejected', () => {
  assert.throws(
    () => validateRects([{ selector: '#credit-limit' }]),
    (err) => err instanceof AnnotationError && /no `label`/.test(err.message)
  );
});

test('the rejection explains WHY a label is required, not just that it is', () => {
  try {
    validateRects([{ selector: '#x' }]);
    assert.fail('expected a throw');
  } catch (err) {
    assert.match(err.message, /map to a written question/);
    assert.match(err.message, /cannot be referred to/);
  }
});

test('a rectangle without a selector is rejected — the whole page is not an annotation', () => {
  assert.throws(
    () => validateRects([{ label: 'Q1' }]),
    (err) => err instanceof AnnotationError && /no `selector`/.test(err.message)
  );
});

test('two rectangles sharing a label are rejected — the mapping must be one-to-one', () => {
  assert.throws(
    () => validateRects([
      { selector: '#a', label: 'Q1' },
      { selector: '#b', label: 'Q1' },
    ]),
    (err) => err instanceof AnnotationError && /Duplicate rectangle label/.test(err.message)
  );
});

test('an empty rectangle list is rejected — an annotated shot with no rectangle is a screenshot', () => {
  assert.throws(() => validateRects([]), AnnotationError);
  assert.throws(() => validateRects(undefined), AnnotationError);
});

test('several unclear items on one screen become several separately-labelled rectangles', () => {
  const rects = validateRects([
    { selector: '#credit-limit', label: 'Q1' },
    { selector: '#reaching-pct', label: 'Q2', note: 'no units shown' },
    { selector: '.pcc-table', label: 'FINDING-012' },
  ]);
  assert.equal(rects.length, 3);
  assert.deepEqual(rects.map((r) => r.label), ['Q1', 'Q2', 'FINDING-012']);
  assert.equal(rects[1].note, 'no units shown');
  assert.equal(rects[0].note, null);
});

test('labels and selectors are trimmed, so trailing whitespace is not a distinct label', () => {
  const rects = validateRects([{ selector: '  #a  ', label: '  Q1  ' }]);
  assert.equal(rects[0].selector, '#a');
  assert.equal(rects[0].label, 'Q1');
});

// ── The rectangle must not hide what it points at ────────────────────────────────────────────

test('the rectangle is an outline, never a fill', () => {
  const css = overlayCss();
  assert.match(css, /background:\s*transparent/);
  assert.match(css, new RegExp(`border:\\s*\\d+px solid ${RECT_COLOR}`));
  // No opacity layer over the element, which would dim the text/value/icon underneath.
  assert.doesNotMatch(css, /\.agentic-rect[^}]*opacity/);
});

test('every injected node is pointer-events: none, so the overlay cannot trigger behaviour', () => {
  const css = overlayCss();
  assert.match(css, new RegExp(`#${OVERLAY_ID}, #${OVERLAY_ID} \\* \\{ pointer-events: none`));
});

test('the overlay is scoped to one container id, so removal cannot half-succeed', () => {
  const css = overlayCss();
  const payload = buildOverlayPayload(validateRects([{ selector: '#a', label: 'Q1' }]));
  assert.equal(payload.overlayId, OVERLAY_ID);
  assert.ok(css.includes(`#${OVERLAY_ID}`));
  assert.match(buildCleanupScript().toString(), /getElementById\(overlayId\)/);
});

test('cleanup also sweeps stray annotation containers from an earlier crashed capture', () => {
  assert.match(buildCleanupScript().toString(), /data-agentic-annotation="true"/);
});

test('cleanup never throws — it runs from a finally and must not mask the real error', () => {
  const src = buildCleanupScript().toString();
  assert.match(src, /try \{/);
  assert.match(src, /catch \{\s*return false;/);
});

test('the overlay script positions rectangles in DOCUMENT coordinates, for full-page captures', () => {
  const src = buildOverlayScript().toString();
  assert.match(src, /window\.scrollX/);
  assert.match(src, /window\.scrollY/);
  assert.match(src, /getBoundingClientRect/);
});

test('the overlay script reports labels whose selector matched nothing', () => {
  const src = buildOverlayScript().toString();
  assert.match(src, /missing\.push\(rect\.label\)/);
  assert.match(src, /return \{ drawn, missing \}/);
});

// ── Filename pairing ─────────────────────────────────────────────────────────────────────────

test('the annotated copy is derivable from the original name, in both directions', () => {
  assert.equal(annotatedName('failure.png'), `failure${ANNOTATED_SUFFIX}.png`);
  assert.equal(annotatedName('failure'), `failure${ANNOTATED_SUFFIX}.png`);
  assert.equal(annotatedName('full_page.PNG'), `full_page${ANNOTATED_SUFFIX}.png`);
});

test('the annotated name does not collide with the standard evidence filenames', () => {
  const standard = ['before.png', 'after.png', 'failure.png', 'full_page.png'];
  for (const s of standard) {
    assert.notEqual(annotatedName(s), s, `${s} must not be its own annotated copy`);
    assert.ok(!standard.includes(annotatedName(s)));
  }
});

// ── Static-mode fallback (Decision 2) ────────────────────────────────────────────────────────

test('the not-capturable note is one fixed, greppable string naming the mode', () => {
  assert.equal(
    notCapturableNote('Static Artifact'),
    'Annotated evidence not capturable — Discovery Mode: Static Artifact'
  );
  assert.equal(
    notCapturableNote('Existing Screenshots'),
    'Annotated evidence not capturable — Discovery Mode: Existing Screenshots'
  );
});

test('a missing mode is recorded as Unknown rather than producing a half-formed note', () => {
  assert.equal(
    notCapturableNote(''),
    'Annotated evidence not capturable — Discovery Mode: Unknown'
  );
  assert.equal(
    notCapturableNote(undefined),
    'Annotated evidence not capturable — Discovery Mode: Unknown'
  );
});

// ── In-page behaviour, against a real DOM ────────────────────────────────────────────────────
//
// Skipped automatically when no browser binary is installed, so the suite stays runnable on a
// machine that has never run `playwright install`. Skipping is reported, never silent.

async function withPage(fn) {
  let chromium;
  try {
    ({ chromium } = require('playwright'));
  } catch {
    return { skipped: 'playwright is not installed' };
  }
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
  } catch (err) {
    return { skipped: `no browser binary (${err.message.split('\n')[0]})` };
  }
  try {
    const page = await browser.newPage();
    await page.setContent(`
      <style>body{margin:0;padding:40px} #tall{height:1200px}</style>
      <div id="tall"></div>
      <input id="credit-limit" value="50000">
      <button id="submit">Send For Approval</button>
    `);
    await fn(page);
    return { skipped: null };
  } finally {
    await browser.close();
  }
}

test('the overlay draws one rectangle per located element and reports the misses', async (t) => {
  const { skipped } = await withPage(async (page) => {
    const rects = validateRects([
      { selector: '#credit-limit', label: 'Q1' },
      { selector: '#does-not-exist', label: 'Q2' },
    ]);
    const result = await page.evaluate(buildOverlayScript(), buildOverlayPayload(rects));

    assert.equal(result.drawn.length, 1);
    assert.equal(result.drawn[0].label, 'Q1');
    assert.deepEqual(result.missing, ['Q2'], 'a selector that matched nothing must be reported');
    assert.ok(result.drawn[0].width > 0 && result.drawn[0].height > 0);
  });
  if (skipped) t.skip(skipped);
});

test('the element below the fold is boxed at its DOCUMENT position, not its viewport position', async (t) => {
  const { skipped } = await withPage(async (page) => {
    await page.setViewportSize({ width: 800, height: 200 });
    const rects = validateRects([{ selector: '#submit', label: 'Q1' }]);
    const result = await page.evaluate(buildOverlayScript(), buildOverlayPayload(rects));

    // #submit sits below a 1200px spacer, so a viewport-relative box would be near y=0 and wrong.
    assert.ok(
      result.drawn[0].top > 1000,
      `expected a document-relative top past the spacer, got ${result.drawn[0].top}`
    );
  });
  if (skipped) t.skip(skipped);
});

test('cleanup removes the overlay completely and is idempotent', async (t) => {
  const { skipped } = await withPage(async (page) => {
    const rects = validateRects([{ selector: '#credit-limit', label: 'Q1' }]);
    await page.evaluate(buildOverlayScript(), buildOverlayPayload(rects));
    assert.equal(await page.locator(`#${OVERLAY_ID}`).count(), 1);

    assert.equal(await page.evaluate(buildCleanupScript(), OVERLAY_ID), true);
    assert.equal(await page.locator(`#${OVERLAY_ID}`).count(), 0);
    assert.equal(await page.locator('[data-agentic-annotation="true"]').count(), 0);

    // Running it again on an already-clean page must succeed, not throw.
    assert.equal(await page.evaluate(buildCleanupScript(), OVERLAY_ID), true);
  });
  if (skipped) t.skip(skipped);
});

test('the overlay does not intercept clicks on the element it surrounds', async (t) => {
  const { skipped } = await withPage(async (page) => {
    await page.evaluate(() => {
      window.__clicked = false;
      document.getElementById('submit').addEventListener('click', () => { window.__clicked = true; });
    });
    const rects = validateRects([{ selector: '#submit', label: 'Q1' }]);
    await page.evaluate(buildOverlayScript(), buildOverlayPayload(rects));

    await page.locator('#submit').click();
    assert.equal(await page.evaluate(() => window.__clicked), true,
      'pointer-events:none must let the real element remain reachable');
  });
  if (skipped) t.skip(skipped);
});

// ── annotatedScreenshot: ordering, and cleanup that is actually guaranteed ───────────────────
//
// Exercised against the REAL method with a stub page, so the `finally` path is the one shipped
// rather than a re-implementation of it. A full BrowserDriver session would need credentials and a
// live application, which would test the login flow rather than this contract.

const fs = require('fs');
const os = require('os');
const path = require('path');
const { BrowserDriver } = require('../api');

function stubSession({ failScreenshotOn = null } = {}) {
  const calls = [];
  const page = {
    async screenshot({ path: p }) {
      calls.push({ op: 'screenshot', path: p });
      if (failScreenshotOn && String(p).includes(failScreenshotOn)) {
        throw new Error('capture exploded');
      }
      fs.writeFileSync(p, 'PNG');
    },
    async evaluate(fn, arg) {
      const name = fn === cleanupFunction ? 'cleanup' : 'overlay';
      calls.push({ op: name, arg });
      return name === 'overlay' ? { drawn: [{ label: 'Q1' }], missing: [] } : true;
    },
  };
  const driver = Object.create(BrowserDriver.prototype);
  driver.page = page;
  return { driver, calls };
}

test('the ORIGINAL is captured before a single node is injected', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'annot-'));
  try {
    const { driver, calls } = stubSession();
    const out = await driver.annotatedScreenshot('failure', [{ selector: '#a', label: 'Q1' }], { dir });

    const ops = calls.map((c) => c.op);
    assert.deepEqual(ops, ['screenshot', 'overlay', 'screenshot', 'cleanup'],
      'original must be on disk before the overlay exists, so a later failure still leaves pristine evidence');
    assert.ok(fs.existsSync(out.originalPath));
    assert.ok(fs.existsSync(out.annotatedPath));
    assert.match(out.annotatedPath, /failure\.annotated\.png$/);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('cleanup still runs when the annotated capture throws', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'annot-'));
  try {
    const { driver, calls } = stubSession({ failScreenshotOn: '.annotated.' });

    await assert.rejects(
      () => driver.annotatedScreenshot('failure', [{ selector: '#a', label: 'Q1' }], { dir }),
      /capture exploded/
    );

    assert.ok(calls.some((c) => c.op === 'cleanup'),
      'the finally must fire — a stray rectangle surviving into a later Finding is worse than none');
    // And the pristine original survived the failure.
    assert.ok(fs.existsSync(path.join(dir, 'failure.png')));
    assert.equal(fs.existsSync(path.join(dir, 'failure.annotated.png')), false);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('an unlabelled rectangle is rejected before any file is written', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'annot-'));
  try {
    const { driver, calls } = stubSession();
    await assert.rejects(
      () => driver.annotatedScreenshot('failure', [{ selector: '#a' }], { dir }),
      AnnotationError
    );
    assert.equal(calls.length, 0, 'validation must precede capture');
    assert.deepEqual(fs.readdirSync(dir), []);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('a selector that matched nothing comes back in `missing`, not silently dropped', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'annot-'));
  try {
    const { driver } = stubSession();
    driver.page.evaluate = async (fn) => (fn === cleanupFunction
      ? true
      : { drawn: [], missing: ['Q2'] });

    const out = await driver.annotatedScreenshot('x', [{ selector: '#gone', label: 'Q2' }], { dir });
    assert.deepEqual(out.missing, ['Q2']);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('a cleanup that itself fails does not mask the capture error', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'annot-'));
  try {
    const { driver } = stubSession({ failScreenshotOn: '.annotated.' });
    const realEval = driver.page.evaluate;
    driver.page.evaluate = async (fn, arg) => {
      if (fn === cleanupFunction) throw new Error('page already closed');
      return realEval(fn, arg);
    };

    await assert.rejects(
      () => driver.annotatedScreenshot('failure', [{ selector: '#a', label: 'Q1' }], { dir }),
      /capture exploded/,
      'the ORIGINAL error must survive, not be replaced by the cleanup error'
    );
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('re-injecting replaces the prior overlay rather than stacking a second one', async (t) => {
  const { skipped } = await withPage(async (page) => {
    const rects = validateRects([{ selector: '#credit-limit', label: 'Q1' }]);
    await page.evaluate(buildOverlayScript(), buildOverlayPayload(rects));
    await page.evaluate(buildOverlayScript(), buildOverlayPayload(rects));
    assert.equal(await page.locator('[data-agentic-annotation="true"]').count(), 1);
  });
  if (skipped) t.skip(skipped);
});
