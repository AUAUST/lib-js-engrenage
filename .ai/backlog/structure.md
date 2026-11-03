# structure

Project structure description, its report and the tooling generated from it.

## 1. Machine-readable output of `engrenage structure`.

- Matter: the structure report (#156) prints text only; editor integrations would need it as data.
- Expected: a `--json` flag printing the resolved structure with each directory's classification and source.
- Done when a consumer needs it and the flag exists.
