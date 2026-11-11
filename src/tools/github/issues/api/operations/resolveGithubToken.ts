import { spawnProcess } from "#foundation/processes/index";

export async function resolveGithubToken(): Promise<string> {
  const token = process.env["GH_TOKEN"] || process.env["GITHUB_TOKEN"];

  if (token !== undefined) {
    return token;
  }

  const {
    status,
    stdout,
    error,
  } = await spawnProcess("gh", ["auth", "token"], {});

  const fromCli = stdout.trim();

  if (error !== undefined || status !== 0 || fromCli === "") {
    throw new Error(
      "No GitHub token: set GH_TOKEN or GITHUB_TOKEN, or log in with `gh auth login`",
      { cause: error },
    );
  }

  return fromCli;
}
