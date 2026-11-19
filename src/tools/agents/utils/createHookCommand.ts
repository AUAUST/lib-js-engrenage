import { hookProgram, hookProgramSource, pnpmWorkspaceFile } from "#constants";
import { gitDirectory } from "#tools/git/constants";

// @debt the walk restates `findRepositoryRoot` and the workspace root as shell tests, bounding the root by markers rather than the config lookup
export function createHookCommand(args: string): string {
  return `r="\${CLAUDE_PROJECT_DIR:-}"; if [ -z "$r" ]; then r="\${PWD%%/node_modules/*}"; while [ ! -x "$r/node_modules/.bin/${hookProgram}" ] && [ ! -f "$r/${hookProgramSource}" ] && [ ! -e "$r/${gitDirectory}" ] && [ ! -f "$r/${pnpmWorkspaceFile}" ] && [ "$r" != / ]; do r="$(dirname -- "$r")"; done; fi; cd -- "$r" || exit 0; if [ -x node_modules/.bin/${hookProgram} ]; then exec node_modules/.bin/${hookProgram} ${args}; fi; if [ -f ${hookProgramSource} ]; then exec node ${hookProgramSource} ${args}; fi; printf '%s\\n' '{"systemMessage":"engrenage hooks are off: ${hookProgram} is not installed in this project; run pnpm install"}'`;
}
