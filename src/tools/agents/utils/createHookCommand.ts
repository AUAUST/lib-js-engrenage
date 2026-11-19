import { hookProgram, hookProgramSource } from "#tools/agents/constants";

export function createHookCommand(args: string): string {
  return `r="\${CLAUDE_PROJECT_DIR:-}"; if [ -z "$r" ]; then r="\${PWD%%/node_modules/*}"; while [ ! -x "$r/node_modules/.bin/${hookProgram}" ] && [ ! -f "$r/${hookProgramSource}" ] && [ "$r" != / ]; do r="$(dirname -- "$r")"; done; fi; cd -- "$r" || exit 0; if [ -x node_modules/.bin/${hookProgram} ]; then exec node_modules/.bin/${hookProgram} ${args}; fi; if [ -f ${hookProgramSource} ]; then exec node ${hookProgramSource} ${args}; fi; printf '%s\\n' '{"systemMessage":"engrenage hooks are off: ${hookProgram} is not installed in this project; run pnpm install"}'`;
}
