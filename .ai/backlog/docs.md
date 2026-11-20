# Docs

`project/docs`: doc tag declarations and the readers of tagged source.

## 1. Doc tag consumers outside `readDocTag` look declarations up by name in the resolved list.

- why: `canonicalJsdoc` (`formatTag`, `getRank` per sort comparison), `createTsdownConfig` (`output`) and `docs.docTags` (`byName`, for tags other than the one read) each scan or index `docs.tags`.
- want: the `docs` key hands out the list with a name index and rank.
- done: one lookup owner remains.

## 2. The JSDoc parser keeps a dependency it barely uses and misreads indented fences

- sites: `src/foundation/jsdoc/utils/parseJsdoc.ts:28`, `src/foundation/jsdoc/utils/parseJsdoc.ts:74`
- why: comment-parser only splits lines while `splitTags` re-tokenizes them; fences indented up to three spaces are not recognised, so an `@` inside starts a tag. Related: `prettier.8`.
- want: a plain line splitter replacing comment-parser; Markdown fence rules.
