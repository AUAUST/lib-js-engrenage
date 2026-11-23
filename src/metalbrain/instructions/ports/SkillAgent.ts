// @debt `effort`, `efforts` and `thoroughness` are typed as strings, checked only by `skillSchema` in `metalbrain/runtimes`, which owns their vocabularies above this layer
/**
 * The subagent a skill defines, whose agent file sync generates from the skill's
 * body in each preferred runtime's agents directory.
 */
export interface SkillAgent {
  /**
   * The agent's name, its file stem in each runtime's agents directory.
   */
  readonly name: string;
  /**
   * When the main session dispatches the agent, written to its agent file.
   */
  readonly description: string;
  /**
   * The model the agent runs on; the runtime's default without it.
   */
  readonly model?: string;
  /**
   * The agent's default reasoning effort.
   */
  readonly effort?: string;
  /**
   * The reasoning effort by issue complexity, overriding `effort` for a
   * dispatch naming it.
   */
  readonly efforts?: {
    readonly trivial?: string;
    readonly involved?: string;
    readonly complex?: string;
  };
  /**
   * The only tools the agent may use; every tool without it.
   */
  readonly tools?: readonly string[];
  /**
   * The tools the agent may not use.
   */
  readonly disallowedTools?: readonly string[];
  /**
   * Whether the stop gate blocks the agent's first stop on a failing tree.
   */
  readonly gate?: boolean;
  /**
   * How far the agent digs without a brief's `Thoroughness:` line;
   * `standard` without it.
   */
  readonly thoroughness?: string;
  /**
   * The context size up to which the agent is resumed rather than started fresh.
   */
  readonly ceiling?: number;
}
