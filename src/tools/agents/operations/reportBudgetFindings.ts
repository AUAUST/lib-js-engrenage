import { formatBudgetFinding } from "#tools/agents/utils/formatBudgetFinding";
import type { BudgetFinding } from "#tools/agents/types/BudgetFinding";
import type { BudgetMode } from "#tools/agents/types/BudgetMode";
import type { HookEvent } from "#tools/agents/types/HookEvent";

export function reportBudgetFindings(
  findings: readonly BudgetFinding[],
  { mode, event }: { mode: BudgetMode; event: HookEvent },
) {
  if (findings.length === 0) {
    return;
  }

  const message = findings.map(formatBudgetFinding).join("\n");

  const output = mode === "warn"
    ? {
        systemMessage: message,
        hookSpecificOutput: {
          hookEventName: event,
          additionalContext: message,
        },
      }
    : event === "PreToolUse"
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
