---
id: REASON-001
category: reasoning
title: Prefer Direct Observation over secondary/documentation sources for expected values
status: confirmed
tags: [evidence-sourcing, assertions, epistemics]
producer: automation-execution-agent
consumers: [automation-execution-agent, automation-agent, test-design-agent]
promoted_from: NDC/REP-002
confidence: "1 execution, 3 test cases, 1 project"
related_knowledge: []
created: 2026-07-14
last_updated: 2026-07-21
version: 1
---

## Problem

An automation script's expected assertion value was sourced from secondary/Documentation-category evidence (e.g., a separate reference codebase's existing tests) rather than this platform's own Direct Observation of the live application — the assumed value can be stale relative to current live behavior.

## Strategy

Replace the assumed expected value with the value actually, directly observed during execution (captured in the failure's own evidence — log/screenshot showing the real rendered text), and prefer Direct Observation over any secondary source going forward for the same field.

## Applicable Conditions

Any assertion whose expected value was carried forward from a Reference Automation Project, prior documentation, or another non-Direct-Observation source, rather than confirmed by this platform's own Discovery or a prior successful execution.

## Confidence

Confirmed by 1 execution, across 3 test cases, across 1 project.

## Confirmed In

- [[NDC/REP-002]] — `projects/NDC/knowledge_base/repair/REP-002.md`
