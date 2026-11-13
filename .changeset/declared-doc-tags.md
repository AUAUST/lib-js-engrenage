---
"@auaust/engrenage": patch
---

- Add `./docs`, exporting a preset per standard TSDoc and TypeScript tag and `createTagPreset`, as experimental
- Add the `docs.tags` option and the `docs.tags` slot for extensions to contribute ordered tag declarations
- Add the `docs.docTags` ESLint convention, reporting undeclared, malformed, repeated and mutually exclusive tags, `@param` and `@typeParam` names absent from the signature, and blocks on overload implementations
- Accept the `doc`, `docs`, `param` and `params` abbreviations in `stylistic.nameReplacements`
