/**
 * @experimental
 */
export interface RoleRuleModule {
  /**
   * The tool running the rule; each tool applies only its own modules and skips
   * the others, so ESLint takes `eslint`.
   */
  readonly tool: string;
}
