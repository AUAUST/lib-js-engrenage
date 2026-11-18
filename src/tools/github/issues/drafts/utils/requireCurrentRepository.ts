import type { DraftsContext } from "#tools/github/issues/drafts/types/DraftsContext";

export function requireCurrentRepository(
  context: Pick<DraftsContext, "repository">,
  subject: string,
): string {
  if (context.repository === undefined) {
    throw new Error(
      `${subject} needs the current repository: set \`repository\` in package.json or add an \`origin\` remote`,
    );
  }

  return context.repository;
}
