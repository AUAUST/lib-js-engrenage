import { values } from "@auaust/toolkit/object";

import { projectMapDirectory } from "#tools/agents/constants";
import { renderProjectMap } from "#tools/agents/utils/renderProjectMap";
import type { OptionContext } from "#foundation/options/index";
import type { ProjectMapSections } from "#tools/agents/types/ProjectMapSections";

export async function syncProjectMap({
  get,
}: OptionContext<ProjectMapSections>) {
  const [
    filesystem,
    agents,
    structure,
    aliases,
    importRules,
    source,
    scripts,
    tooling,
    tests,
  ] = await Promise.all([
    get("filesystem"),
    get("agents"),
    get("structure"),
    get("aliases"),
    get("importRules"),
    get("src"),
    get("scripts"),
    get("tooling"),
    get("tests"),
  ]);

  if (
    (agents.preferred?.length ?? 0) === 0 ||
    values(structure).every((environment) => environment === undefined)
  ) {
    return;
  }

  const maps = renderProjectMap({
    structure,
    importRules,
    roles: {
      src: source.roles,
      scripts: scripts.roles,
      tooling: tooling.roles,
      tests: tests.roles,
    },
    aliases: [...aliases.global, ...aliases.src],
    patterns: tests.patterns,
  });

  await Promise.all(
    maps.map(({ file, content }) => filesystem.write(file, content)),
  );

  const written = new Set(maps.map(({ file }) => file));

  for (const file of await filesystem.glob(`${projectMapDirectory}/*.md`)) {
    if (!written.has(file)) {
      await filesystem.remove(file);
    }
  }
}
