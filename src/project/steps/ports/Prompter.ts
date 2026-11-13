/**
 * @experimental
 */
export interface Prompter {
  /**
   * Asks a yes-or-no question, `initial` defaulting to `true`. Resolves to
   * `initial` without asking when every question is accepted up front.
   */
  confirm(message: string, initial?: boolean): Promise<boolean>;
  /**
   * Asks for one of `values`, preselecting `initial`. Resolves to `initial`
   * without asking when every question is accepted up front.
   */
  select<Value extends string>(
    message: string,
    values: readonly Value[],
    initial: Value,
  ): Promise<Value>;
  /**
   * Asks for a non-blank answer prefilled with `initial` and resolves to it
   * trimmed. Resolves to `initial` without asking when every question is accepted
   * up front.
   */
  text(message: string, initial: string): Promise<string>;
  /**
   * Asks for any subset of `values`, possibly empty, preselecting `initial` (none
   * by default), and resolves to it in the order of `values`. Resolves to a copy
   * of `initial` without asking when every question is accepted up front.
   */
  multiselect<Value extends string>(
    message: string,
    values: readonly Value[],
    initial?: readonly Value[],
  ): Promise<Value[]>;
}
