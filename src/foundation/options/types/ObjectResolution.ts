import type { DeclarationEntries } from "#foundation/options/types/DeclarationEntries";
import type { ObjectOutput } from "#foundation/options/types/ObjectOutput";

export type ObjectResolution<Entries extends DeclarationEntries, Disabled> = [
  Disabled,
] extends [never]
  ? ObjectOutput<Entries>
  : | (ObjectOutput<Entries> & { readonly enabled: true })
    | (Disabled & { readonly enabled: false });
