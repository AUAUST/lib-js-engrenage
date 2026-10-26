---
"@auaust/engrenage": minor
---

Two new shared agent rules describe the AUAUST helper libraries:

- `@auaust/engrenage/agents/rules/prefer-toolkit.md` covers the `@auaust/toolkit` conventions: object helpers instead of `Object.*`, `isArray`, `isNull`/`isUndefined` only as callbacks, subpath entries, `is<Type>` helpers, and preferring toolkit when primitive-kit provides the same helper.
- `@auaust/engrenage/agents/rules/prefer-primitive-kit.md` covers the `@auaust/primitive-kit` conventions: subpath entries, and helpers over native methods with an equivalent.

A project that depends on a library references its rule from `.claude/rules/`, so the rule is either present and strict or absent.

**Breaking:** `code-style.md` and the `auaust-libraries` section no longer mention toolkit or primitive-kit. Projects using these libraries must reference the new rules to keep that guidance.
