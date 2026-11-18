import { githubSnapshotFile } from "#tools/github/issues/api/constants";
import { readGithubSnapshot } from "#tools/github/issues/api/index";
import {
  checkContractNames,
  renderPlanningSheet,
} from "#tools/github/issues/contract/index";
import type { LoadedConfig } from "#project/config/index";

export async function fillPlanningSheet(config: LoadedConfig): Promise<string> {
  const [
    { contract: contractNames, repositories },
    snapshot,
  ] = await Promise.all([config.resolve("github"), readGithubSnapshot(config)]);

  const file = githubSnapshotFile;

  if (snapshot === undefined) {
    config.context.reporter.warn(
      `No GitHub snapshot at ${file}: the planning sheet describes meanings without their GitHub names`,
      { fix: "run `engrenage github fetch`" },
    );
  } else {
    const problems = checkContractNames(contractNames, snapshot);

    if (problems.length > 0) {
      throw new Error(
        `The issue contract maps names missing from ${file} (fix \`github.contract\` or run \`engrenage github fetch\`):\n${problems
          .map((problem) => `- ${problem}`)
          .join("\n")}`,
      );
    }
  }

  return renderPlanningSheet({
    contractNames,
    snapshot,
    repositories: await repositories(),
    file,
  });
}
