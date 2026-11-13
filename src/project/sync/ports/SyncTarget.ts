import type { EntryShape, HookEntry } from "#foundation/extensions/index";
import type { SyncDone } from "#project/sync/ports/SyncDone";
import type { SyncRun } from "#project/sync/ports/SyncRun";
import type { SyncStage } from "#project/sync/ports/SyncStage";

/**
 * @experimental
 */
export interface SyncTarget extends EntryShape {
  /**
   * Selects the target on the command line and prefixes its flags' options.
   */
  readonly name: string;
  /**
   * When the target runs: `generate` targets run first and the config forgets
   * its resolved sections after the last of them; a `check` target's error is
   * reported as a failure once every target ran, while any other target's error
   * aborts the sync.
   */
  readonly stage: SyncStage;
  /**
   * The target's boolean options, each flag name mapped to the description of
   * its `--<name>-<flag>` option; the run receives the flags given.
   */
  readonly flags?: Readonly<Record<string, string>>;
  /**
   * The files and parts the target reads; within its stage, it runs after the
   * targets producing them, and reading one a later stage produces is an error.
   */
  readonly reads?: readonly string[];
  /**
   * The files and parts the target writes, which order the targets reading them
   * after it.
   */
  readonly produces?: readonly string[];
  /**
   * Loads the target's run, only when the target is selected.
   */
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
