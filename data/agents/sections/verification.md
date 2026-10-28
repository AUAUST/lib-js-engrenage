---
title: Verification
description: Verify and report changes.
category: workflow
default: true
order: 70
---

## Verification

- Before delivery, review the work against architectural boundaries and quality requirements, not only behavior.
- Tests live under the root `tests/`, organized by the area they exercise. Write the minimum needed for confidence, usually one expected case and one meaningful edge case. Reuse existing tests before adding new ones.
- Format only changed files, never the whole repository.
- Report actual results and blockers, including unavailable integrations and skipped checks. Never weaken compiler or lint settings to hide failures.
