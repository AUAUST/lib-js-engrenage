import { join } from "node:path";

import {
  startsDirectory,
  statsDirectory,
} from "#metalbrain/runtimes/hooks/constants";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";

/**
 * The file holding a tool call's start time, between its PreToolUse and
 * PostToolUse hooks.
 */
export function resolveStartFile(
  root: Directory,
  call: { readonly session: string; readonly toolUse: string },
): File {
  return join(
    root,
    statsDirectory,
    call.session,
    startsDirectory,
    call.toolUse,
  );
}
