---
title: Precedence and conflicts
description: Resolve conflicting instructions.
category: workflow
default: true
order: 20
---

## Precedence and conflicts

- Precedence: an explicit user decision for the current task, then the project's own instructions, then shared instructions from `@auaust/engrenage`, then existing code patterns. Existing code never justifies repeating a violation.
- When a request contradicts these rules, would create debt, or asks for an inappropriate abstraction, stop before implementing it: explain the issue and propose an alternative. If the user confirms, implement it as a one-time exception, never a precedent, and keep every other rule.
- When a conflict between rules, code and request has no clear resolution, ask instead of guessing.
