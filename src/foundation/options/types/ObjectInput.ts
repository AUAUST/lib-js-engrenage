import type { Simplify } from "@auaust/toolkit/types";

import type { DeclarationEntries } from "#options/types/DeclarationEntries";
import type { InputOf } from "#options/types/InputOf";

export type ObjectInput<Entries extends DeclarationEntries> = Simplify<
  {
    [
      Key in keyof Entries as undefined extends InputOf<Entries[Key]>
        ? Key
        : never
    ]?: InputOf<Entries[Key]>;
  } & {
    [
      Key in keyof Entries as undefined extends InputOf<Entries[Key]>
        ? never
        : Key
    ]: InputOf<Entries[Key]>;
  }
>;
