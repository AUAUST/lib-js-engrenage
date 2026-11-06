---
title: Verification
description: Verify and report changes.
category: workflow
default: true
order: 70
---

## Verification

- Before delivery, review the work against architectural boundaries and quality requirements, not only behavior.
- Write the minimum tests needed for confidence, usually one expected case and one meaningful edge case. Reuse existing tests before adding new ones.
- Pass the commit gate with every commit you make; never bypass it.
- Report actual results and blockers, including unavailable integrations and skipped checks. Never weaken compiler or lint settings to hide failures.
