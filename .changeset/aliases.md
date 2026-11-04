---
"@auaust/engrenage": patch
---

- Add `aliases`, `src.aliases` and `src.bundled`, and generate `package.json#imports` (and the bundled `paths` of the tsconfig) from the project structure with `engrenage sync aliases`
- Set the src tsconfig `module` and `moduleResolution` from `src.bundled`
