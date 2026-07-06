# FINDING-004

- **Finding Type:** Security Concern
- **Severity:** Medium
- **Confidence:** 90%
- **Status:** Needs Human Review

## Description

The Forgot Password flow produces a **starkly different outcome** depending on whether the submitted username exists: a known/valid username (`Admin`) consistently causes a ~30-second hang ending in `504 Gateway Time-out` (2/2 attempts), while an unknown/nonexistent username consistently returns the normal `"Reset Password link sent successfully"` message within about a second (2/2 attempts, two different fake usernames). This means an observer can reliably distinguish a valid username from an invalid one purely by which of these two outcomes (and their very different response times) occurs — **without reading any message text at all** — which undermines the anti-enumeration intent of the PRD's own anti-enumeration requirement, even though this run also did not observe the message *text* itself differ when both paths do return a message.

## Expected Behavior

Per Project Context §6 Carried-Forward Assumption #3 (PRD §5.1 FR-3 / §10 SR-3): the flow "must return a generic success message regardless of whether the username exists (anti-enumeration)" — the clear intent, beyond matching message text, is that an outside observer cannot determine username validity from this flow's behavior. The Project Context and PRD are silent on response-timing/availability as a distinct channel from message text; this Finding's "Needs Human Review" status reflects that the anti-enumeration requirement's precise scope (text-only vs. behavior-and-timing) is not explicitly defined.

## Actual Behavior

| Username | Outcome | Approx. response time |
|---|---|---|
| `Admin` (valid) | `504 Gateway Time-out` | ~30s (client-side action timeout) — reproduced 2/2 |
| `nonexistent_user_xyz123` (invalid) | `"Reset Password link sent successfully"` | ~1s |
| `another_nonexistent_user_456` (invalid) | `"Reset Password link sent successfully"` | ~1s |

The valid-username case never actually returns the PRD-required generic success message at all (see `FINDING-003`); the invalid-username case does, quickly. This binary, highly-reliable, easily-observed difference (timeout+error-page vs. fast+success-page) is a textbook timing/behavioral side-channel for username enumeration — arguably a more practical enumeration vector than a message-text difference would be, since it requires no careful comparison of wording, only observing which of two very different pages/durations occurred.

## Steps to Reproduce

1. Submit the Forgot Password form with a known-valid username (e.g., `Admin`) — observe the ~30s hang and `504`.
2. Submit the same form with an unimportant, made-up username — observe a fast, normal success message.
3. Repeat each at least once — the asymmetry is consistent, not a one-off fluke.

## Related Module

Login / Authentication & Access — Forgot Password flow (PRD §5.1 FR-3, §10 SR-3)

## Related User Journey

Password reset request — username enumeration via response behavior

## Retry Result

Not applicable in the Retry Policy (§5.6) sense — the underlying timeout behavior's retry handling is documented in `FINDING-003`. This Finding's own "retry" was validating the *differential pattern* itself: the unknown-username path was independently confirmed twice (2 different fake usernames, both fast/successful) specifically to rule out a one-off fluke before finalizing this Finding, in line with Investigation Workflow step 2 (Validate).

## Investigation Notes

This is an Authorization/information-disclosure-adjacent candidate (closest Investigation Mode category: Authorization's "deep links"/access-boundary spirit, applied here to an unauthenticated-user-enumeration boundary rather than a session boundary) layered on top of the Validation-category timeout investigated in `FINDING-003`. The two Findings are deliberately kept separate: `FINDING-003` is a functional-defect framing (the flow doesn't work for real accounts) aimed at the development team; this Finding is a security/information-disclosure framing (the *asymmetry itself* leaks username validity) aimed at a security reviewer — the same underlying observation supports two distinct, non-overlapping "best-fitting" classifications per §5.2, each valid for its own stakeholder, rather than forcing one Finding to carry two Types.

Per §4 Core Philosophy #4, resolved this as `Needs Human Review` rather than `Confirmed`: the PRD's anti-enumeration requirement is clear in intent but silent on whether timing/availability asymmetry (as opposed to message-text asymmetry, which was previously confirmed identical in the legacy exploration) falls within its scope. This agent does not assume the stricter interpretation on the requirement's behalf.

Severity assessed as `Medium` (Validation/business-rule-inconsistency-adjacent — the anti-enumeration business rule is functionally undermined) rather than `High`/`Critical`, since no core workflow is blocked for legitimate users of *this* flow's intended purpose (an attacker enumerating usernames is a confidentiality concern, not an availability-of-required-functionality one in the Severity Matrix's own terms) and no direct security breach occurred within this session — consistent with the Matrix's ordering (High/Critical criteria not met; Medium's "business rule inconsistency" fits).

## Occurrence Count

1

## Evidence List

- `known_user_timeout.png` — the 504 outcome for the valid username (same capture as `FINDING-003/failure.png`)
- `unknown_user_success.png` — the normal success-message outcome for an unknown username
- Console/network detail for the timeout side is recorded in `FINDING-003`'s evidence package rather than duplicated here, per §5.11 (no duplicate evidence files for the same underlying captured state)

## Recommendation

Ask the Product Owner / Security stakeholder whether response-time/availability parity between valid and invalid usernames should be considered in-scope for the existing anti-enumeration requirement (FR-3/SR-3), or whether that requirement is understood to cover message text only. Independent of that policy question, resolving `FINDING-003`'s underlying 504 will very likely resolve this Finding's asymmetry as a side effect — worth tracking together but verifying both are actually closed once a fix lands, since a fix that merely makes the valid-username path *fail fast* (e.g., a quick error instead of a slow 504) would close `FINDING-003`'s literal timeout but could still leave a smaller timing asymmetry for this Finding to re-check.
