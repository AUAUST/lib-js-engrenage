import type { Declaration } from "#foundation/options/ports/Declaration";
import type { DeclarationEntries } from "#foundation/options/types/DeclarationEntries";

// @debt a declaration contextually typed by the `DeclarationEntries` constraint infers a `never` context, read here as no requirement instead of inferring `unknown` at its declarer
type ContextOf<Source> = Source extends Declaration<
  unknown,
  unknown,
  infer Context
>
  ? [Context] extends [never]
    ? unknown
    : Context
  : unknown;

export type ObjectContext<Entries extends DeclarationEntries> = {
  [Key in keyof Entries]: (context: ContextOf<Entries[Key]>) => void;
}[keyof Entries] extends (context: infer Context) => void
  ? Context
  : unknown;
