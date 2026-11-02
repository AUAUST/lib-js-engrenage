---
"@auaust/engrenage": minor
---

- Add the `disposable` and `float16` groups to `src.apis`: they type `Symbol.dispose`, `Disposable`, `Float16Array` and `Math.f16round` in a library's own source, which are not Baseline widely available, while a consumer still resolves them from its own lib only
