# gate

The commit gate and its process locks.

## 1. Gate checks leave unchecked paths

- sites: `src/workflows/gate/operations/runGate.ts:97`, `:309`; `src/tools/prettier/extension.ts:45`; `src/tools/eslint/conventions/stylistic/noComplexConciseArrows.ts`; `src/tools/jscpd/extension.ts:22`; `src/tools/jscpd/operations/reportClones.ts:34`
- why: staged mode reads the worktree, not the index; `eslint --fix` runs before `prettier --write`, so layout rules miss Prettier's rewrites; jscpd only warns and reports clones of every changed file; a stamped tree hides budget warnings. Dependents' type-aware lint: #284.
- want: each gap checked by the gate, or recorded as an accepted limit (planning).

## 2. Process locks and gate state leave stale or double holders

- sites: `src/foundation/processes/operations/withProcessLock.ts:83`, `:116`, `:179`; `src/workflows/gate/operations/runGate.ts:379`; `src/workflows/gate/operations/checkAgentStop.ts:33`
- why: a waiter moving away a holder can leave two holders; a reused pid blocks waiters until timeout; a signal before the release listeners leaves the lock; a signal leaves the lock released while spawned tools write; the failing-tree marker hashes after the lock release.
- want: lock acquisition and release covering signals and pid reuse (planning).

## 3. `GateWarning` repeats `GateFailure`'s shape

- site: `src/workflows/gate/types/GateWarning.ts:1`
- want: one gate entry type carrying its severity.
