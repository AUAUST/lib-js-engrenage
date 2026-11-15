import { resolveWithin } from "#foundation/filesystem/index";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";

export function resolveAgentRunFile(
  directory: Directory,
  run: { session: string; agent: string },
  state: "recorded" | "running",
): File {
  return resolveWithin(
    directory,
    run.session,
    `${run.agent}${state === "recorded" ? ".json" : ".running"}`,
  );
}
