import type { EntryShape } from "#foundation/extensions/types/EntryShape";

export interface HookEntry<Payload> extends EntryShape {
  load(): Promise<(payload: Payload) => void | Promise<void>>;
}
