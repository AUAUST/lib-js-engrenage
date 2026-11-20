# pnpm

pnpm integration and package-manager scripts.

## 1. Build policies of installed packages are hand-listed in the pnpm domain

- site: `src/tools/pnpm/constants.ts:14`
- why: an init step adding a package with an unlisted build script fails the install with `ERR_PNPM_IGNORED_BUILDS`; lefthook did.
- want: the step or extension adding a package declares its build policy and the pnpm workspace settings collect them (planning: new contract).

## 2. Variables pnpm sets for binaries are observed, not documented

- sites: `src/tools/pnpm/constants.ts:28`
- why: listed from pnpm 12 runs, so a pnpm release may change them silently.
- want: a documented source, or a test catching drift.
