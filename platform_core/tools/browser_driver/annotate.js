// Discovery annotation overlay — the rectangle that turns "here is a screenshot" into
// "here is exactly what I could not understand".
//
// See .claude/skills/explorer-skill/SKILL.md §5.10–§5.12 and §11 rule 34.
//
// WHY THIS EXISTS
//   A Discovery Finding that says "a field on this form is unclear" and attaches a full-page
//   screenshot of a 45-field form has not communicated anything a reviewer can act on. The reviewer
//   has to guess which field, and a guess is exactly what the Finding was raised to avoid. A precise
//   rectangle plus a numbered question turns an unanswerable observation into a decidable one.
//
// WHY AN OVERLAY AND NOT IMAGE POST-PROCESSING
//   This package ships with ZERO runtime dependencies. Drawing a box on a PNG would mean adding an
//   image library (sharp/jimp — native, heavy) to every repo that installs this platform, in order
//   to draw a box. Injecting the box into the page instead needs nothing but the Playwright session
//   we already have, and gets exact element bounds for free — including for elements below the fold
//   in a full-page capture, where page coordinates and viewport coordinates disagree.
//
// THE OVERLAY CONTRACT (user-mandated, 2026-08-17)
//   The overlay is permitted ONLY because it is inert. It:
//     - changes no application data and no application state;
//     - triggers no input, submission, navigation, or business behaviour;
//     - contains only visual annotation elements;
//     - is removed immediately after the annotated screenshot is captured;
//     - is removed through a GUARANTEED cleanup path even when capture throws;
//     - is never present during any later interaction or evidence capture.
//
//   Two properties enforce the "triggers nothing" half mechanically, and both are load-bearing:
//   every injected node carries `pointer-events: none`, so it cannot intercept or generate a click;
//   and the whole overlay lives in one container with a known id, so removal is one operation that
//   cannot half-succeed.
//
// PURE BY DESIGN
//   Everything here is a pure function over plain data — no Playwright import, no page handle. The
//   rules worth testing (a rect must carry a label, outlines never fill, cleanup targets exactly one
//   container) are then testable without launching a browser.

'use strict';

/** The single container id. One known id means removal is one query, and cannot half-succeed. */
const OVERLAY_ID = '__agentic_discovery_annotation__';

/** Suffix distinguishing an annotated copy from the original it was taken from. */
const ANNOTATED_SUFFIX = '.annotated';

/**
 * High-contrast against both light and dark application chrome. Not configurable per call: an
 * annotation whose colour varies per Finding is harder to recognise across an evidence package,
 * and "which red did this one use" is not a question worth being able to ask.
 */
const RECT_COLOR = '#FF1E1E';
const LABEL_TEXT_COLOR = '#FFFFFF';
const RECT_BORDER_WIDTH = 3;

class AnnotationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AnnotationError';
  }
}

/**
 * Validates the rectangles a caller asked for.
 *
 * Every rect MUST carry a label, and that is not a formatting preference: the rule this implements
 * says every rectangle maps to a written question. An unlabelled box on a screenshot is a smudge —
 * the reviewer cannot tell which of three questions it belongs to. Rejecting it here is the only
 * place that mapping can be guaranteed rather than hoped for.
 *
 * @param {Array<{selector: string, label: string, note?: string}>} rects
 * @returns {Array<{selector: string, label: string, note: string|null}>}
 */
function validateRects(rects) {
  if (!Array.isArray(rects) || rects.length === 0) {
    throw new AnnotationError(
      'At least one rectangle is required. An "annotated" screenshot with no rectangle is just a '
      + 'screenshot, and would satisfy the evidence rule without satisfying its purpose.'
    );
  }

  const seen = new Set();
  return rects.map((rect, i) => {
    if (!rect || typeof rect !== 'object') {
      throw new AnnotationError(`Rectangle ${i + 1} is not an object.`);
    }
    const selector = typeof rect.selector === 'string' ? rect.selector.trim() : '';
    const label = typeof rect.label === 'string' ? rect.label.trim() : '';

    if (!selector) {
      throw new AnnotationError(
        `Rectangle ${i + 1} has no \`selector\`. The rectangle must surround a specific element — `
        + 'highlighting the whole page when one control is unclear defeats the point.'
      );
    }
    if (!label) {
      throw new AnnotationError(
        `Rectangle ${i + 1} (selector "${selector}") has no \`label\`. Every rectangle must map to a `
        + 'written question in the Finding — e.g. "Q1", or the Open Question ID. An unlabelled '
        + 'rectangle cannot be referred to, so the question it marks cannot be answered.'
      );
    }
    if (seen.has(label)) {
      throw new AnnotationError(
        `Duplicate rectangle label "${label}". Labels identify questions one-to-one; two rectangles `
        + 'sharing a label make the mapping ambiguous.'
      );
    }
    seen.add(label);

    return { selector, label, note: typeof rect.note === 'string' && rect.note.trim() ? rect.note.trim() : null };
  });
}

/**
 * The CSS injected with the overlay.
 *
 * `background: transparent` and an OUTLINE rather than a filled box are the rule "must not hide the
 * element's text, value, icon, or surrounding context", expressed in the only place it can actually
 * be enforced. `pointer-events: none` is what makes the overlay incapable of triggering behaviour.
 *
 * @returns {string}
 */
function overlayCss() {
  return [
    `#${OVERLAY_ID}, #${OVERLAY_ID} * { pointer-events: none !important; }`,
    `#${OVERLAY_ID} { position: absolute; top: 0; left: 0; width: 0; height: 0;`,
    '  margin: 0; padding: 0; border: 0; z-index: 2147483647; }',
    `#${OVERLAY_ID} .agentic-rect { position: absolute; box-sizing: border-box;`,
    `  border: ${RECT_BORDER_WIDTH}px solid ${RECT_COLOR};`,
    // Transparent fill — the element under the rectangle stays fully readable.
    '  background: transparent;',
    // A soft white halo so the border stays visible against a red or dark background too.
    '  box-shadow: 0 0 0 1px rgba(255,255,255,0.9), inset 0 0 0 1px rgba(255,255,255,0.9); }',
    `#${OVERLAY_ID} .agentic-label { position: absolute; font: 700 12px/1.4 system-ui, sans-serif;`,
    `  background: ${RECT_COLOR}; color: ${LABEL_TEXT_COLOR}; padding: 1px 6px; border-radius: 3px;`,
    '  white-space: nowrap; }',
  ].join('\n');
}

/* eslint-env browser */
/* global document, window */

/**
 * Runs IN THE PAGE to build the overlay. Serialized across by Playwright, so it must be
 * self-contained — no closure over anything in this module.
 *
 * Element bounds are read with getBoundingClientRect() + scroll offsets, giving DOCUMENT
 * coordinates — which is what a full-page screenshot needs. Viewport coordinates would place every
 * rectangle correctly on a viewport capture and wrongly on a full-page one, and full-page is this
 * driver's default.
 *
 * A selector matching nothing is REPORTED rather than silently skipped: a missing rectangle is a
 * missing question, and the caller must know before it publishes the evidence.
 *
 * @param {{overlayId: string, css: string, rects: Array<object>}} payload
 * @returns {{drawn: object[], missing: string[]}}
 */
function overlayFunction(payload) {
  const { overlayId, css, rects } = payload;
  const prior = document.getElementById(overlayId);
  if (prior) prior.remove();

  const host = document.createElement('div');
  host.id = overlayId;
  host.setAttribute('data-agentic-annotation', 'true');

  const style = document.createElement('style');
  style.textContent = css;
  host.appendChild(style);

  const missing = [];
  const drawn = [];
  const sx = window.scrollX || document.documentElement.scrollLeft || 0;
  const sy = window.scrollY || document.documentElement.scrollTop || 0;

  for (const rect of rects) {
    let el = null;
    try { el = document.querySelector(rect.selector); } catch { el = null; }
    if (!el) { missing.push(rect.label); continue; }

    const b = el.getBoundingClientRect();
    if (b.width === 0 && b.height === 0) { missing.push(rect.label); continue; }

    // A few pixels of breathing room so the border sits AROUND the element rather than on top of
    // its own edge — which is what keeps the element's text, value and icon fully readable.
    const pad = 4;
    const top = b.top + sy - pad;
    const left = b.left + sx - pad;
    const width = b.width + pad * 2;
    const height = b.height + pad * 2;

    const box = document.createElement('div');
    box.className = 'agentic-rect';
    box.style.top = `${top}px`;
    box.style.left = `${left}px`;
    box.style.width = `${width}px`;
    box.style.height = `${height}px`;
    host.appendChild(box);

    const label = document.createElement('div');
    label.className = 'agentic-label';
    label.textContent = rect.label;
    // Above the box by default; tucked inside the top edge when the box is at the page top, so the
    // label is never clipped off the canvas.
    label.style.top = `${top - 20 < 0 ? top + 2 : top - 20}px`;
    label.style.left = `${left}px`;
    host.appendChild(label);

    drawn.push({ label: rect.label, top, left, width, height });
  }

  document.body.appendChild(host);
  return { drawn, missing };
}

/**
 * Runs IN THE PAGE to remove the overlay.
 *
 * Idempotent and never throws: it is called from a `finally`, and a cleanup that could throw would
 * mask the original capture failure with a second, less useful error.
 *
 * @param {string} overlayId
 * @returns {boolean}
 */
function cleanupFunction(overlayId) {
  try {
    const host = document.getElementById(overlayId);
    if (host) host.remove();
    // Belt and braces: if an earlier crashed capture left one behind, take those too, so a stray
    // rectangle can never appear in a LATER Finding's evidence pointing at the wrong question.
    for (const stray of document.querySelectorAll('[data-agentic-annotation="true"]')) {
      stray.remove();
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * The overlay builder, as a function reference for `page.evaluate`.
 *
 * A function, not a source string: Playwright treats a string argument as an expression to evaluate
 * and drops the payload, which silently produced an empty overlay and `undefined` result. The
 * accessor shape is kept so callers read as "build me the script" rather than reaching for a
 * globally-shared function object.
 *
 * @returns {Function}
 */
function buildOverlayScript() {
  return overlayFunction;
}

/** The cleanup routine, as a function reference for `page.evaluate`. @returns {Function} */
function buildCleanupScript() {
  return cleanupFunction;
}

/**
 * The payload handed to the overlay script.
 * @param {Array<object>} rects - already validated
 * @returns {{overlayId: string, css: string, rects: Array<object>}}
 */
function buildOverlayPayload(rects) {
  return { overlayId: OVERLAY_ID, css: overlayCss(), rects };
}

/**
 * The annotated filename for a given original.
 *
 * `failure.png` -> `failure.annotated.png`. The pair is derivable in both directions, so a reviewer
 * looking at one can always find the other, and neither name collides with the standard evidence
 * filenames in §5.12.
 *
 * @param {string} name
 * @returns {string}
 */
function annotatedName(name) {
  const base = String(name);
  if (base.toLowerCase().endsWith('.png')) {
    return `${base.slice(0, -4)}${ANNOTATED_SUFFIX}.png`;
  }
  return `${base}${ANNOTATED_SUFFIX}.png`;
}

/**
 * The line a Finding records when annotation is technically unavailable (Decision 2).
 *
 * Deliberately a fixed, greppable string. The exception exists only for Discovery Modes with no live
 * page — supplied screenshots, recordings, documents, static artifacts — and stating it in one exact
 * form is what makes "was this exempted honestly, or skipped?" answerable later by search.
 *
 * @param {string} mode - the Discovery Mode in force
 * @returns {string}
 */
function notCapturableNote(mode) {
  const m = String(mode || '').trim() || 'Unknown';
  return `Annotated evidence not capturable — Discovery Mode: ${m}`;
}

module.exports = {
  OVERLAY_ID,
  ANNOTATED_SUFFIX,
  RECT_COLOR,
  RECT_BORDER_WIDTH,
  AnnotationError,
  validateRects,
  overlayCss,
  overlayFunction,
  cleanupFunction,
  buildOverlayScript,
  buildCleanupScript,
  buildOverlayPayload,
  annotatedName,
  notCapturableNote,
};
