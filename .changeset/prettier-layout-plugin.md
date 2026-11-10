---
"@auaust/engrenage": minor
---

- Prettier now owns multiline declaration and expression padding, case padding and object brace newlines, through a layout plugin `createPrettierConfig` appends after every other plugin; padding now also follows lines Prettier wraps
- **Breaking:** removed the `stylistic.paddedMultilineDeclarations`, `stylistic.paddedMultilineExpressions`, `stylistic.paddedCases` and `stylistic.objectCurlyNewline` ESLint toggles
