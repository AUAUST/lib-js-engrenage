import { createFilesystem } from "#foundation/filesystem/operations/createFilesystem";
import { createSections } from "#foundation/options/utils/createSections";
import { liveSections } from "#project/config/constants";
import { createProjectSections } from "#project/config/operations/createProjectSections";
import { formatContent } from "#project/format/index";
import { resolveAgents } from "#tools/agents/index";
import { resolveGit } from "#tools/git/index";
import { resolveGithub } from "#tools/github/index";
import { formatWithPrettier } from "#tools/prettier/adapters/formatWithPrettier";
import { resolvePrettier } from "#tools/prettier/index";
import { resolveVscode } from "#tools/vscode/index";
import type { Filesystem } from "#foundation/filesystem/types/Filesystem";
import type { OptionContext } from "#foundation/options/types/OptionContext";
import type { RawConfig } from "#project/config/types/RawConfig";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";
import type { Config } from "#workflows/registry/types/Config";

export function createConfig({
  root,
  raw,
  configFile,
  filesystem = createFilesystem(root, (path, content) => {
    return formatContent(content, {
      path,
      root,
      formatter: formatWithPrettier,
    });
  }),
}: {
  root: Directory;
  raw: RawConfig;
  configFile: File | undefined;
  filesystem?: Filesystem;
}): Config {
  const registry: OptionContext<Config> & { readonly sections: Config } =
    createSections<Config>(
      {
        ...createProjectSections({
          root,
          raw,
          configFile,
          filesystem,
          context: {
            get(section) {
              return registry.get(section);
            },
          },
        }),
        agents: () => resolveAgents(raw, registry),
        git: () => resolveGit(raw, registry),
        github: () => resolveGithub(raw, registry),
        prettier: () => resolvePrettier(raw, registry),
        vscode: () => resolveVscode(raw, registry),
      },
      liveSections,
    );

  return registry.sections;
}
