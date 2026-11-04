export interface Invocation {
  command: string;
  args: readonly string[];
  interactive: boolean;
}
