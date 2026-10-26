---
"@auaust/engrenage": patch
---

- `loadConfig` retries a load that failed instead of caching the error.
- A tsconfig that matches no file yet still exposes its compiler options.
- Subpath imports with conditional targets resolve through their `default` condition, and targets with several `*` fail instead of being skipped.
- Path aliases outside the package name, wildcard aliases without exactly one `*` on each side fail with a message instead of producing broken tsdown entries, and targets only match files.
