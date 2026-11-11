import type { EntryShape, HookEntry } from "#foundation/extensions/index";
import type { SyncDone } from "#project/sync/ports/SyncDone";
import type { SyncRun } from "#project/sync/ports/SyncRun";
import type { SyncStage } from "#project/sync/ports/SyncStage";

/** @experimental */
export interface SyncTarget extends EntryShape {
  readonly name: string;
  readonly stage: SyncStage;
  readonly flags?: Readonly<Record<string, string>>;
  readonly reads?: readonly string[];
  readonly produces?: readonly string[];
  load(): Promise<SyncRun>;
}

declare global {
  namespace Engrenage {
    interface Slots {
      "sync.targets": SyncTarget;
      "sync.done": HookEntry<SyncDone>;
    }
  }
}
