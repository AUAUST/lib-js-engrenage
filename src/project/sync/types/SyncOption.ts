export interface SyncOption {
  readonly target: string;
  readonly flag: string;
  /**
   * The option's name, its long flag: `<target>-<flag>`.
   */
  readonly name: string;
  readonly description: string;
}
