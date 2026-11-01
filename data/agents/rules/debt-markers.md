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

- When code you write or touch could be better and you are not fixing it, add a `@debt <statement>` comment next to it in the same edit. One comment holds one marker: `// @debt <statement>`, or a block comment for a longer note.
- State what could be better, at the level you see it. Propose no fix and name no abstraction: a marker never needs more knowledge than you already have.
- Watch for, among others: the same few lines you have seen in other files, even when each copy is clean; having to read an implementation to use something correctly; a workaround for broken behavior or a type issue; a fallback or default value hardcoded outside the configuration that owns it. A note matching none of these is still welcome.
- Mark only files you change. When the same matter appears in files you only read, name them in the note, for example "same sequence as `syncEditHook.ts`". Report debt unrelated to your change in your final report instead.
- Debt never fails a check; only a malformed marker fails lint. Remove a marker only when your change resolves it.
