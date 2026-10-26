import { map } from "@auaust/primitive-kit/arrays";

import { filesIn } from "#utils/filesIn";
import type { ResolvedConfig } from "#config/types/ResolvedConfig";
import type { ScopeReference } from "#eslint/types/ScopeReference";
import type { Glob } from "#types/Glob";

export function resolveScopeReference(
  { files, directories }: ResolvedConfig,
  reference: ScopeReference,
): readonly Glob[] {
  switch (reference) {
    case "files.code":
      return [files.code];
    case "files.test":
      return [files.test];
    case "files.config":
      return files.config;
    case "files.discovered":
      return files.discovered;
    case "directories.source":
      return map(directories.source, (directory) => {
        return filesIn(directory, files.code);
      });
    case "directories.test":
      return map(directories.test, (directory) => {
        return filesIn(directory, files.code);
      });
  }
}
