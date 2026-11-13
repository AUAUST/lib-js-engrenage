import type { ESLint } from "eslint";

import { eslint } from "#constants";
import { MissingEslintError } from "#tools/eslint/errors/MissingEslintError";
import type { LoadedConfig } from "#project/config/index";

export async function loadEslint({
  resolve,
  context,
}: LoadedConfig): Promise<
  (options: Omit<ESLint.Options, "cwd" | "cache">) => ESLint
> {
  const environment = await resolve("environment");

  if (!environment.hasDependency(eslint)) {
    throw new MissingEslintError();
  }

  const { ESLint } = await import("eslint");

  function createLinter(options: Omit<ESLint.Options, "cwd" | "cache">) {
    return new ESLint({
      ...options,
      cwd: context.root,
      cache: false,
    });
  }

  return createLinter;
}
