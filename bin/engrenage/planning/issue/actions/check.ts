import { checkIssues } from "#tools/github/index";
import { readLinks } from "#tools/pnpm/index";
import { getRunContext } from "#workflows/cli/index";
import { loadValidatedConfig } from "#workflows/config/index";

export default async function (
  stems: readonly string[],
  {
    for: audience,
    checkout,
  }: { for: "worker" | "debugger"; checkout: readonly string[] },
): Promise<void> {
  const root = process.cwd();

  const config = await loadValidatedConfig(root, {
    reporter: getRunContext().reporter,
  });

  const { lines, passed } = await checkIssues(config, stems, audience, {
    checkout,
    linked: await readLinks(root),
  });

  for (const line of lines) {
    getRunContext().reporter.log(line);
  }

  if (!passed) {
    process.exitCode = 1;
  }
}
