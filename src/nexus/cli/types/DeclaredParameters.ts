import type { ArgumentDeclaration } from "#nexus/cli/types/ArgumentDeclaration";
import type { OptionDeclaration } from "#nexus/cli/types/OptionDeclaration";

type ArgumentValue<Item, List, Optional> = List extends true
  ? Item[]
  : Optional extends true
    ? Item | undefined
    : Item;

type ArgumentValues<Arguments extends readonly ArgumentDeclaration[]> = {
  -readonly [
    Index in keyof Arguments
  ]: Arguments[Index] extends ArgumentDeclaration<
    infer Item,
    infer List,
    infer Optional
  >
    ? ArgumentValue<Item, List, Optional>
    : never;
};

type OptionValues<Options extends readonly unknown[]> = {
  readonly [
    Option in Extract<Options[number], OptionDeclaration> as Option["name"]
  ]: Option extends OptionDeclaration<string, infer Value> ? Value : never;
};

/**
 * The parameters a command's action receives from its declarations: each
 * argument's value, then its options' values keyed by name when it declares any.
 */
export type DeclaredParameters<
  Arguments extends readonly ArgumentDeclaration[],
  Options extends readonly unknown[],
> = [
  ...ArgumentValues<Arguments>,
  ...(Options extends readonly [] ? [] : [OptionValues<Options>]),
];
