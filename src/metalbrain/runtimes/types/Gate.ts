export interface Gate {
  readonly commands: readonly string[];
  readonly hook: boolean | undefined;
}
