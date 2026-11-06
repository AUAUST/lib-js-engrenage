const repositoryPattern =
  /^(?:(?:git\+)?(?:https?|ssh|git):\/\/(?:[^@/]+@)?github\.com\/|git@github\.com:|github:)?([\w.-]+\/[\w.-]+?)(?:\.git)?\/?$/;

export function parseRepository(value: string): string | undefined {
  return repositoryPattern.exec(value.trim())?.[1];
}
