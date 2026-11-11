import {
  isMissingResource,
  splitRepository,
  type GithubAccess,
} from "#tools/github/issues/api/index";

export async function findMissingReferences(
  { repository, client }: GithubAccess,
  numbers: readonly number[],
): Promise<readonly number[]> {
  const found = await Promise.all(
    numbers.map(async (number) => {
      try {
        await client.request(
          "GET /repos/{owner}/{repo}/issues/{issue_number}",
          { ...splitRepository(repository), issue_number: number },
        );
      } catch (error) {
        if (isMissingResource(error)) {
          return number;
        }

        throw error;
      }
    }),
  );

  return found.filter((number) => number !== undefined);
}
