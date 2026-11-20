import { hookProgram, hookProgramSource, pnpmWorkspaceFile } from "#constants";
import { gitDirectory } from "#tools/git/constants";
import type { HookProgram } from "#tools/agents/types/HookProgram";

const defaultProgram = {
  name: hookProgram,
  source: hookProgramSource,
} as const satisfies HookProgram;

// @debt the walk restates `findRepositoryRoot` and the workspace root as shell tests, bounding the root by markers rather than the config lookup
export function createHookCommand(
  args: string,
  { name, source }: HookProgram = defaultProgram,
): string {
  return `r="\${CLAUDE_PROJECT_DIR:-}"; if [ -z "$r" ]; then r="\${PWD%%/node_modules/*}"; while [ ! -x "$r/node_modules/.bin/${name}" ] && [ ! -f "$r/${source}" ] && [ ! -e "$r/${gitDirectory}" ] && [ ! -f "$r/${pnpmWorkspaceFile}" ] && [ "$r" != / ]; do r="$(dirname -- "$r")"; done; fi; cd -- "$r" || exit 0; if [ -x node_modules/.bin/${name} ]; then exec node_modules/.bin/${name} ${args}; fi; if [ -f ${source} ]; then exec node ${source} ${args}; fi; printf '%s\\n' '{"systemMessage":"engrenage hooks are off: ${name} is not installed in this project; run pnpm install"}'`;
}
