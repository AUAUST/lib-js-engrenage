import { freeze } from "@auaust/toolkit/object";

import type { File } from "#types/File";

export const arethetypeswrongCore = "@arethetypeswrong/core";

export const changesetsChangelogGithub = "@changesets/changelog-github";

export const changesetsCli = "@changesets/cli";

export const changesetsConfig = "@changesets/config";

export const engrenage = "@auaust/engrenage";

export const eslint = "eslint";

export const prettier = "prettier";

export const primitiveKit = "@auaust/primitive-kit";

export const publint = "publint";

export const toolkit = "@auaust/toolkit";

export const tsdown = "tsdown";

export const tsx = "tsx";

export const typescript = "typescript";

export const valibot = "valibot";

export const vite = "vite";

export const vitest = "vitest";

export const vitestCoverageIstanbul = "@vitest/coverage-istanbul";

export const zod = "zod";

export const packages = freeze({
  arethetypeswrongCore,
  changesetsChangelogGithub,
  changesetsCli,
  changesetsConfig,
  engrenage,
  eslint,
  prettier,
  primitiveKit,
  publint,
  toolkit,
  tsdown,
  tsx,
  typescript,
  valibot,
  vite,
  vitest,
  vitestCoverageIstanbul,
  zod,
});

export const engrenageConfigFile = "engrenage.config" satisfies File;

export const gitignoreFile = ".gitignore" satisfies File;

export const packageJsonFile = "package.json" satisfies File;

export const prettierignoreFile = ".prettierignore" satisfies File;

export const tsconfigFile = "tsconfig.json" satisfies File;

export const files = freeze({
  engrenageConfig: engrenageConfigFile,
  gitignore: gitignoreFile,
  packageJson: packageJsonFile,
  prettierignore: prettierignoreFile,
  tsconfig: tsconfigFile,
} as const);

export const organization = "@auaust";

export const packageTypes = freeze(["module", "commonjs"] as const);

export const publishAccess = freeze(["public", "restricted"] as const);
