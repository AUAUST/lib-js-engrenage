import {
  createFilesystem,
  type Filesystem,
} from "#foundation/filesystem/index";
import { createSections, type OptionContext } from "#foundation/options/index";
import { liveSections } from "#project/config/constants";
import { createProjectSections, type RawConfig } from "#project/config/index";
import { formatContent } from "#project/format/index";
import { resolveAgents } from "#tools/agents/index";
import { resolveGit } from "#tools/git/index";
import { resolveGithub } from "#tools/github/index";
import { formatWithPrettier } from "#tools/prettier/adapters/formatWithPrettier";
import { resolvePrettier } from "#tools/prettier/index";
import { resolveVscode } from "#tools/vscode/index";
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
