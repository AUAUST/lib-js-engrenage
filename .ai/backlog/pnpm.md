# pnpm

pnpm integration and package-manager scripts.

## 1. `lefthook: false` build exemption is an unchecked assumption

- site: `src/tools/pnpm/constants.ts:14`
- why: listed to avoid `ERR_PNPM_IGNORED_BUILDS` for consumers; only tests pin the entries.
- want: a check or a documented limit (planning).
