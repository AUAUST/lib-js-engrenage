# Docs

`project/docs`: doc tag declarations and the readers of tagged source.

## 1. Doc tag consumers outside `readDocTag` look declarations up by name in the resolved list.

- why: `canonicalJsdoc` (`formatTag`, `getRank` per sort comparison), `createTsdownConfig` (`output`) and `docs.docTags` (`byName`, for tags other than the one read) each scan or index `docs.tags`.
- want: the `docs` key hands out the list with a name index and rank.
- done: one lookup owner remains.
