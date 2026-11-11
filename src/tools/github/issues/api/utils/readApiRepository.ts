export function readApiRepository(url: string): string {
  const repository = /\/repos\/([\w.-]+\/[\w.-]+)$/.exec(
    new URL(url).pathname,
  )?.[1];

  if (repository === undefined) {
    throw new Error(`${url} is not a GitHub API repository URL`);
  }

  return repository;
}
