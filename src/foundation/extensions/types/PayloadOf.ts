import type { HookEntry } from "#foundation/extensions/types/HookEntry";

export type PayloadOf<Entry> = Entry extends HookEntry<infer Payload>
  ? Payload
  : never;
