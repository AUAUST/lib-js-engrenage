---
"@auaust/engrenage": minor
---

- **Breaking**: Run a linked checkout's build instead of its sources, and fail before running it when the build is older than the checkout's sources: run `pnpm build` in the checkout after changing it
- Record the sources each tsdown build consumed in `.engrenage/build-sources.json`, ignored by Git and never published
- Report a linked checkout as stale in `engrenage link` from that record instead of file times
- Stop resolving the Prettier config and loading the Vite config natively under the `source` condition
