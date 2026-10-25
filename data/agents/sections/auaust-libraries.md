## AUAUST libraries

- Reuse `@auaust/toolkit` and `@auaust/primitive-kit` instead of reimplementing their helpers; prefer toolkit when both provide one.
- Shared tooling configuration comes from `@auaust/engrenage`. Extend its builders and presets locally instead of copying or redefining them.
