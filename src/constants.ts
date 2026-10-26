import { freeze } from "@auaust/toolkit/object";

import type { File } from "#types/File";

export const changesetsChangelogGithub = "@changesets/changelog-github";

export const changesetsCli = "@changesets/cli";

export const changesetsConfig = "@changesets/config";

export const engrenage = "@auaust/engrenage";

export const eslint = "eslint";

export const prettier = "prettier";

export const primitiveKit = "@auaust/primitive-kit";

export const toolkit = "@auaust/toolkit";

export const tsdown = "tsdown";

export const typescript = "typescript";

export const valibot = "valibot";

export const vite = "vite";

export const vitest = "vitest";

export const zod = "zod";

export const packages = freeze({
  changesetsChangelogGithub,
  changesetsCli,
  changesetsConfig,
  engrenage,
  eslint,
  prettier,
  primitiveKit,
  toolkit,
  tsdown,
  typescript,
  valibot,
  vite,
  vitest,
  zod,
});

export const distTsconfigFile = "tsconfig.dist.json" satisfies File;

export const engrenageConfigFile = "engrenage.config" satisfies File;

export const gitignoreFile = ".gitignore" satisfies File;

export const packageJsonFile = "package.json" satisfies File;

export const prettierignoreFile = ".prettierignore" satisfies File;

export const tsconfigFile = "tsconfig.json" satisfies File;

export const files = freeze({
  distTsconfig: distTsconfigFile,
  engrenageConfig: engrenageConfigFile,
  gitignore: gitignoreFile,
  packageJson: packageJsonFile,
  prettierignore: prettierignoreFile,
  tsconfig: tsconfigFile,
} as const);

export const organization = "@auaust";

export const packageTypes = freeze(["module", "commonjs"] as const);

export const publishAccess = freeze(["public", "restricted"] as const);
