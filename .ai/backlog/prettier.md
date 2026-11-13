# prettier

Prettier conventions and the layout plugin engrenage ships.

## 1. JSDoc wrapping splits Markdown links across lines.

- why: `wrapParagraph` (`src/tools/prettier/utils/wrapParagraph.ts`) keeps only inline code and `{@link …}` whole, as #527 decided, so `[MDN / Reference](url)` breaks inside its text (e.g. `data/apis/encoding.d.ts`); it renders fine but the raw comment reads worse.
- want: a decision whether Markdown link text joins the unsplittable atoms, weighed against longer overflowing lines.
- done: atoms extended, or the current rule confirmed and the entry removed.
