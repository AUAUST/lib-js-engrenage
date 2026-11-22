import type { RecordFields } from "#metalbrain/records/types/RecordFields";

type TextKeys<Fields extends RecordFields> = {
  [Key in keyof Fields]: Fields[Key] extends "text" ? Key : never;
}[keyof Fields];

/**
 * The field values of a new entry of a kind declaring `Fields`: a text per `text`
 * field, an optional list of items per other field.
 */
export type RecordValues<Fields extends RecordFields> = {
  readonly [Key in TextKeys<Fields>]: string;
} & {
  readonly [Key in Exclude<keyof Fields, TextKeys<Fields>>]?:
    readonly string[] | undefined;
};
