import {
  spawnSync,
  type SpawnSyncOptions,
  type SpawnSyncReturns,
} from "node:child_process";

export function spawnProcess(
  command: string,
  args: readonly string[],
  options: SpawnSyncOptions & { encoding: "utf-8" },
): SpawnSyncReturns<string>;
export function spawnProcess(
  command: string,
  args: readonly string[],
  options: SpawnSyncOptions,
): SpawnSyncReturns<Buffer>;
export function spawnProcess(
  command: string,
  args: readonly string[],
  options: SpawnSyncOptions,
): SpawnSyncReturns<Buffer | string> {
  return spawnSync(command, args, options);
}
