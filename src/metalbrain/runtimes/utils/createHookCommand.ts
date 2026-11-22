import { metalbrainHook } from "#metalbrain/runtimes/constants";
import type { HookProgram } from "#metalbrain/runtimes/types/HookProgram";
import type { HookRoots } from "#metalbrain/runtimes/types/HookRoots";

// @debt the walk restates the host's repository and workspace root lookups as shell tests, bounding the root by markers rather than the config lookup
export function createHookCommand(
  args: string,
  { repository, workspace }: HookRoots,
  { name, source }: HookProgram = metalbrainHook,
): string {
  return `r="\${CLAUDE_PROJECT_DIR:-}"; if [ -z "$r" ]; then r="\${PWD%%/node_modules/*}"; while [ ! -x "$r/node_modules/.bin/${name}" ] && [ ! -f "$r/${source}" ] && [ ! -e "$r/${repository}" ] && [ ! -f "$r/${workspace}" ] && [ "$r" != / ]; do r="$(dirname -- "$r")"; done; fi; cd -- "$r" || exit 0; if [ -x node_modules/.bin/${name} ]; then exec node_modules/.bin/${name} ${args}; fi; if [ -f ${source} ]; then exec node ${source} ${args}; fi; printf '%s\\n' '{"systemMessage":"engrenage hooks are off: ${name} is not installed in this project; run pnpm install"}'`;
}
