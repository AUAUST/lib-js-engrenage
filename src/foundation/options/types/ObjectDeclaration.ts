import type { Declaration } from "#options/types/Declaration";
import type { DeclarationEntries } from "#options/types/DeclarationEntries";

export interface ObjectDeclaration<
  Entries extends DeclarationEntries,
  Input,
  Output,
  Context,
> extends Declaration<Input, Output, Context> {
  readonly entries: Entries;
}
