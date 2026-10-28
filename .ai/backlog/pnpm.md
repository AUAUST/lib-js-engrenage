# pnpm

pnpm workspace setup and synchronization.

## 1. Existing pnpm workspace files are not synced.

- Where: `src/pnpm/`, `pnpm-workspace.yaml` of each project
- Problem: `engrenage init` now offers missing build approvals in existing workspaces, but `engrenage sync` does not maintain workspace settings, and the shared `minimumReleaseAgeExclude` keeps being copied by hand. The pnpm version policy (AUAUST/lib-js-engrenage#15) may add `pmOnFail`.
- Fix: an `engrenage sync` target that adds missing shared workspace settings while preserving project entries and explicit choices, using the existing `yaml` dependency.
