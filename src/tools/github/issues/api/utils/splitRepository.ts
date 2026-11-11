export function splitRepository(repository: string): {
  owner: string;
  repo: string;
} {
  const [owner, name, ...rest] = repository.split("/");

  if (owner === undefined || name === undefined || rest.length > 0) {
    throw new Error(`${repository} is not an <owner>/<repo> repository`);
  }

  return { owner, repo: name };
}
