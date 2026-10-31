---
"@auaust/engrenage": minor
---

- Add `src.exports`, `bin.commands` and the `data` environment with its `data.exports` to declare what each environment exposes, resolved into `config.src.exports`, `config.bin.commands` and `config.data`; without `src.exports` and `bin.commands`, entries still come from the tsconfig `paths` and the `bin.dirs` files
- Fail the tsdown build when `src` and `data.exports` expose the same subpath
- Move the tsdown `customExports` option to `data.exports` in the engrenage config
