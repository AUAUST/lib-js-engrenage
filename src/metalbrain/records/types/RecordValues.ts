import type { RecordFields } from "#metalbrain/records/types/RecordFields";

type TextKeys<Fields extends RecordFields> = {
  [Key in keyof Fields]: Fields[Key]["type"] extends "text" ? Key : never;
}[keyof Fields];

/**
 * The field values of a new entry of a kind declaring `Fields`: a text per `text`
 * field, an optional list of items per other field; any text or list per name
 * when the fields are known only at runtime, which the kind's schema then checks.
 */
export type RecordValues<
  Fields extends RecordFields,
> = string extends keyof Fields
  ? Readonly<Record<string, string | readonly string[] | undefined>>
  : {
      readonly [Key in TextKeys<Fields>]: string;
    } & {
      readonly [Key in Exclude<keyof Fields, TextKeys<Fields>>]?:
        readonly string[] | undefined;
    };
