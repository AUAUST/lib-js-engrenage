import {
  formatWordCapFinding,
  type WordCapFinding,
  type WordCapMode,
} from "#metalbrain/records/index";
import type { HookVerdict } from "#metalbrain/runtimes/index";

/**
 * The verdict on word-cap findings: a notice shown to the user too in `warn`
 * mode, a denial otherwise, and none without findings.
 */
export function findWordCapVerdict(
  findings: readonly WordCapFinding[],
  mode: WordCapMode,
): HookVerdict | undefined {
  if (findings.length === 0) {
    return;
  }

  const message = findings.map(formatWordCapFinding).join("\n");

  if (mode === "warn") {
    return {
      decision: "context",
      context: message,
      notify: true,
    };
  }

  return {
    decision: "deny",
    reason: message,
  };
}
