/** @experimental */
export interface Prompter {
  confirm(message: string, initial?: boolean): Promise<boolean>;
  select<Value extends string>(
    message: string,
    values: readonly Value[],
    initial: Value,
  ): Promise<Value>;
  text(message: string, initial: string): Promise<string>;
  multiselect<Value extends string>(
    message: string,
    values: readonly Value[],
    initial?: readonly Value[],
  ): Promise<Value[]>;
}
