/**
 * `repository`, the current repository, which `subject` needs.
 *
 * @throws {Error} When `repository` is `undefined`, ending with `hint` when given.
 */
export function requireCurrentRepository(
  repository: string | undefined,
  subject: string,
  hint?: string,
): string {
  if (repository === undefined) {
    throw new Error(
      [
        `${subject} needs the current repository: set \`repository\` in package.json or add an \`origin\` remote`,
        ...(hint === undefined ? [] : [hint]),
      ].join("; "),
    );
  }

  return repository;
}
