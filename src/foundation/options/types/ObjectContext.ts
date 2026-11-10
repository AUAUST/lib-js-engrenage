import type { UnionToIntersection } from "@auaust/toolkit/types";

import type { Declaration } from "#foundation/options/types/Declaration";
import type { DeclarationEntries } from "#foundation/options/types/DeclarationEntries";

type ContextOf<Source> = Source extends Declaration<
  unknown,
  unknown,
  infer Context
>
  ? Context
  : never;

export type ObjectContext<
  Entries extends DeclarationEntries,
> = UnionToIntersection<ContextOf<Entries[keyof Entries]>>;
