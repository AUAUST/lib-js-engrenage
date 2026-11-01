---
title: Debt markers
description: Mark technical debt in the code you change.
category: coding-style
default: true
order: 30
paths:
  - "**/*.{ts,tsx,mts,cts,js,jsx,mjs,cjs}"
---

# Debt markers

- When code you write or touch could be better and you are not fixing it, mark it in the same edit with a comment starting `@debt <statement>`, one marker per comment.
- Mark a concern even when you cannot say how to resolve it: a vague marker beats a dropped concern. State what could be better as you see it, and add a fix only when you already know one.
- Typical signs, not exhaustive: lines repeated across files, even when each copy is clean; an API that requires reading its implementation; a workaround for broken behavior or a type issue; a default hardcoded outside the configuration that owns it; a function, constant or type declared in a file or directory the project's placement rules do not assign it to. Other notes are welcome.
- Mark only files you change, naming files you only read that share the matter. Report debt unrelated to your change in your final report.
- Debt never fails a check. Remove a marker only when your change resolves it.
