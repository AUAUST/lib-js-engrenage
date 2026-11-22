import {
  formatWordCapFinding,
  type WordCapFinding,
  type WordCapMode,
} from "#metalbrain/records/index";
import { writeHookContext, type HookEvent } from "#metalbrain/runtimes/index";

export function reportWordCapFindings(
  findings: readonly WordCapFinding[],
  { mode, event }: { mode: WordCapMode; event: HookEvent },
) {
  if (findings.length === 0) {
    return;
  }

  const message = findings.map(formatWordCapFinding).join("\n");

  if (mode === "warn") {
    return void writeHookContext({
      event,
      context: message,
      notify: true,
    });
  }

  // @debt the deny output repeats `denyToolUse` and every hook output repeats its own stdout JSON write; one hook-output writer could own both
  const output = event === "PreToolUse"
    ? {
        hookSpecificOutput: {
          hookEventName: event,
          permissionDecision: "deny",
          permissionDecisionReason: message,
        },
      }
    : {
        decision: "block",
        reason: message,
      };

  process.stdout.write(`${JSON.stringify(output)}\n`);
}
