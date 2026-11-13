import type { Declaration } from "#foundation/options/ports/Declaration";
import type { DeclarationEntries } from "#foundation/options/types/DeclarationEntries";

export interface ObjectDeclaration<
  Entries extends DeclarationEntries,
  Input,
  Output,
  Context,
> extends Declaration<Input, Output, Context> {
  readonly entries: Entries;
}
