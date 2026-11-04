import type { UnionToIntersection } from "@auaust/toolkit/types";

import type { Declaration } from "#options/types/Declaration";
import type { DeclarationEntries } from "#options/types/DeclarationEntries";

type ContextOf<Source> =
  Source extends Declaration<unknown, unknown, infer Context> ? Context : never;

export type ObjectContext<Entries extends DeclarationEntries> =
  UnionToIntersection<ContextOf<Entries[keyof Entries]>>;
