import { backlog } from "#metalbrain/backlog/constants";
import { getRunContext } from "#nexus/cli/index";
import { loadValidatedConfig } from "#workflows/config/index";

export default async function (): Promise<string> {
  const config = await loadValidatedConfig(process.cwd(), {
    reporter: getRunContext().reporter,
  });

  const { wordCaps } = await config.resolve("agents");

  return `An entry holds at most ${wordCaps[backlog.wordCap]} words across its title and details, sites aside: the ${backlog.wordCap} word cap.`;
}
