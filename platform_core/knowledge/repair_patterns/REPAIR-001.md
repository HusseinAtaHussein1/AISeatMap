---
id: REPAIR-001
category: repair_patterns
title: Bounded poll for post-submit redirect state, not an immediate assertion
status: confirmed
tags: [spa, redirect, authentication, synchronization]
producer: execution-agent
consumers: [execution-agent, automation-agent]
promoted_from: NDC/REP-001
confidence: "1 execution, 1 project"
related_knowledge: []
created: 2026-07-14
last_updated: 2026-07-21
version: 1
---

## Problem

Client-side (SPA) redirect after a form submission — an assertion checking the post-submit page state (title/URL) immediately after the triggering click can run before the redirect completes, since the DOM update is asynchronous and the click itself returns control immediately.

## Strategy

Replace the immediate assertion with a bounded poll (e.g., check every 250ms up to a 10–15s timeout) for the real end-state signal (page title containing the expected value) rather than asserting once with no wait.

## Applicable Conditions

Authentication flows (and any other client-side-routed flow) where a UI action triggers a navigation/redirect and the test asserts on the resulting page's title, URL, or a landing-page element.

## Confidence

Confirmed by 1 execution, across 1 project.

## Confirmed In

- [[NDC/REP-001]] — `projects/NDC/knowledge_base/repair/REP-001.md`
