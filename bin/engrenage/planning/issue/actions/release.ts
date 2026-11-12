import { releaseIssues } from "#tools/github/index";
import { loadValidatedConfig } from "#workflows/config/index";

export default async function (stems: readonly string[]): Promise<void> {
  const config = await loadValidatedConfig(process.cwd());

  for (const { number, released } of await releaseIssues(config, stems)) {
    console.log(`#${number}: ${released ? "released" : "not claimed"}`);
  }
}
