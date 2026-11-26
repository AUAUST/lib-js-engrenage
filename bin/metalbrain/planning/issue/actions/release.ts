import { getRunContext } from "#nexus/cli/index";
import { releaseIssues } from "#tools/github/index";
import { loadValidatedConfig } from "#workflows/config/index";

export default async function (stems: readonly string[]): Promise<void> {
  const config = await loadValidatedConfig(process.cwd(), {
    reporter: getRunContext().reporter,
  });

  for (const { number, released } of await releaseIssues(config, stems)) {
    getRunContext().reporter.log(
      `#${number}: ${released ? "released" : "not claimed"}`,
    );
  }
}
