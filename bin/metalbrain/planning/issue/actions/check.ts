import { checkIssues } from "#tools/github/index";
import { readLinkedCheckouts } from "#tools/pnpm/index";
import { getRunContext } from "#workflows/cli/index";
import { loadValidatedConfig } from "#workflows/config/index";

export default async function (
  stems: readonly string[],
  {
    for: audience,
    checkout,
  }: { for: "worker" | "debugger"; checkout: readonly string[] },
): Promise<void> {
  const config = await loadValidatedConfig(process.cwd(), {
    reporter: getRunContext().reporter,
  });

  const { lines, passed } = await checkIssues(config, stems, audience, {
    checkout,
    linked: await readLinkedCheckouts(config.context.root),
  });

  for (const line of lines) {
    getRunContext().reporter.log(line);
  }

  if (!passed) {
    process.exitCode = 1;
  }
}
