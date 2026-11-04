import type { DeclarationEntries } from "#foundation/options/types/DeclarationEntries";
import type { OutputOf } from "#foundation/options/types/OutputOf";

export type ObjectOutput<Entries extends DeclarationEntries> = {
  readonly [Key in keyof Entries]: OutputOf<Entries[Key]>;
};
