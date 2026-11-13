import type { EntryShape } from "#foundation/extensions/types/EntryShape";

/**
 * An entry of a hook slot: the registry loads its subscriber on each emit to the
 * slot, then awaits it with the emitted payload.
 *
 * @experimental
 */
export interface HookEntry<Payload> extends EntryShape {
  load(): Promise<(payload: Payload) => void | Promise<void>>;
}
