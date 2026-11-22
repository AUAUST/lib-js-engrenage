import type { HostChecks } from "#metalbrain/runtimes/index";

/**
 * Engrenage's host checks for metalbrain's Claude hook events, each loading
 * its code when called.
 */
export const claudeHostChecks: HostChecks = {
  async startRun(payload, context) {
    const {
      startClaudeRun,
    } = await import("#tools/metalbrain/operations/startClaudeRun");

    await startClaudeRun(payload, context);
  },
  async recordRun(payload, context) {
    const {
      recordClaudeStop,
    } = await import("#tools/metalbrain/operations/recordClaudeStop");

    await recordClaudeStop(payload, context);
  },
};
