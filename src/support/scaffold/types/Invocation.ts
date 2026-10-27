export interface Invocation {
  command: string;
  args: ReadonlyArray<string>;
  interactive: boolean;
}
