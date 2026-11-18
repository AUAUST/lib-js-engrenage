export function requireCurrentRepository(
  repository: string | undefined,
  subject: string,
): string {
  if (repository === undefined) {
    throw new Error(
      `${subject} needs the current repository: set \`repository\` in package.json or add an \`origin\` remote`,
    );
  }

  return repository;
}
