import type { RecordFields } from "#metalbrain/records/types/RecordFields";
import type { RecordFieldType } from "#metalbrain/records/types/RecordFieldType";

type KeysOf<Fields extends RecordFields, Type extends RecordFieldType> = {
  [Key in keyof Fields]: Fields[Key]["type"] extends Type ? Key : never;
}[keyof Fields];

/**
 * The field values of a new entry of a kind declaring `Fields`: a text per `text`
 * field, an optional text per `line` field, an optional list of items per other
 * field; any text or list per name when the fields are known only at runtime,
 * which the kind's schema then checks.
 */
export type RecordValues<
  Fields extends RecordFields,
> = string extends keyof Fields
  ? Readonly<Record<string, string | readonly string[] | undefined>>
  : {
      readonly [Key in KeysOf<Fields, "text">]: string;
    } & {
      readonly [Key in KeysOf<Fields, "line">]?: string | undefined;
    } & {
      readonly [
        Key in Exclude<keyof Fields, KeysOf<Fields, "text" | "line">>
      ]?: readonly string[] | undefined;
    };
