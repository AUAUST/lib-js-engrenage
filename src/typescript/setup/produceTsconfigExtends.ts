import { dirname, relative } from "node:path/posix";

import { includes } from "@auaust/primitive-kit/arrays";

import { resolveListOption } from "#config/utils/resolveListOption";
import { engrenage } from "#constants";
import type { ResolvedConfig } from "#config/types/ResolvedConfig";
import type { JsonEdit } from "#support/json/types/JsonEdit";
import type { File } from "#types/File";
import type { TsconfigTarget } from "#typescript/types/TsconfigTarget";

function toRelativeSpecifier(from: File, to: File): string {
  const specifier = relative(dirname(from), to);

  return specifier.startsWith(".") ? specifier : `./${specifier}`;
}

function listDefaultExtends(
  config: ResolvedConfig,
  { key, file }: TsconfigTarget,
): readonly string[] {
  if (key === "base") {
    return includes(config.presets, "library")
      ? [`${engrenage}/tsconfig/library.json`]
      : [`${engrenage}/tsconfig/base.json`];
  }

  const parent =
    key === "tests.dist"
      ? config.tests.tsconfig.file
      : config.typescript.tsconfig.file;

  return parent === undefined ? [] : [toRelativeSpecifier(file, parent)];
}

export function produceTsconfigExtends(
  config: ResolvedConfig,
  target: TsconfigTarget,
): readonly JsonEdit[] {
  const bases = resolveListOption(
    target.extends,
    () => listDefaultExtends(config, target),
    `${target.key}.tsconfig.extends`,
  );

  if (bases === false) {
    return [];
  }

  return [
    {
      path: ["extends"],
      value: bases.length === 1 ? bases[0] : [...bases],
    },
  ];
}
