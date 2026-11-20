import type { Directory } from "#types/Directory";

/**
 * What a hook action runs against: the project root its stats go under and the
 * time, in epoch milliseconds, the hook process started.
 */
export interface HookContext {
  readonly root: Directory;
  readonly time: number;
}
