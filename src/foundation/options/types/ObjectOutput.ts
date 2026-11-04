import type { DeclarationEntries } from "#options/types/DeclarationEntries";
import type { OutputOf } from "#options/types/OutputOf";

export type ObjectOutput<Entries extends DeclarationEntries> = {
  readonly [Key in keyof Entries]: OutputOf<Entries[Key]>;
};
