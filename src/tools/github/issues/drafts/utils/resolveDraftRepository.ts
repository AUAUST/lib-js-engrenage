import { backlogFallbackHint } from "#tools/github/issues/drafts/constants";
import type { DraftsContext } from "#tools/github/issues/drafts/types/DraftsContext";

export function resolveDraftRepository(
  short: string | undefined,
  subject: string,
  { repository, registry }: Pick<DraftsContext, "repository" | "registry">,
): string {
  if (short === undefined) {
    if (repository === undefined) {
      throw new Error(
        `${subject} needs a GitHub repository, and package.json \`repository\` and the \`origin\` remote name none: ${backlogFallbackHint}`,
      );
    }

    return repository;
  }

  const registered = registry.get(short);

  if (registered === undefined) {
    throw new Error(
      `Unknown repository short name \`${short}\`; registered: ${[...registry.keys()].join(", ") || "none"}; ${backlogFallbackHint}`,
    );
  }

  return registered;
}
