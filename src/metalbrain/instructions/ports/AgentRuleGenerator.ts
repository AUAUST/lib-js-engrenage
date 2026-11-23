import type { EntryShape } from "#foundation/extensions/index";
import type { Lazy } from "#foundation/modules/index";
import type { GeneratedRule } from "#metalbrain/instructions/ports/GeneratedRule";
import type { Directory } from "#types/Directory";

/**
 * Lists the rules to write, given the host's input and the rules directory;
 * loaded only when an agent is preferred.
 */
export interface AgentRuleGenerator<Host>
  extends
    EntryShape,
    Lazy<
      (host: Host, directory: Directory) => Promise<readonly GeneratedRule[]>
    > {
  /**
   * Rule files the generator owns in the rules directory: `<name>.md` and
   * `<name>/*.md`. Sync removes those it no longer returns and fails on a
   * rule outside them.
   */
  readonly name: string;
}
