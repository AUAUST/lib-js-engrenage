import {
  formatBudgetFinding,
  type BudgetFinding,
  type BudgetMode,
} from "#metalbrain/records/index";
import { writeHookContext, type HookEvent } from "#metalbrain/runtimes/index";

export function reportBudgetFindings(
  findings: readonly BudgetFinding[],
  { mode, event }: { mode: BudgetMode; event: HookEvent },
) {
  if (findings.length === 0) {
    return;
  }

  const message = findings.map(formatBudgetFinding).join("\n");

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
