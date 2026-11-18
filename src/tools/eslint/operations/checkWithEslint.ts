import { packages } from "#constants";
import { runGateBinary, type GateResult } from "#project/gate/index";
import { resolveEslintArguments } from "#tools/eslint/operations/resolveEslintArguments";
import type { LoadedConfig } from "#project/config/index";

export function checkWithEslint(config: LoadedConfig): Promise<GateResult> {
  return runGateBinary(
    config.context.root,
    packages.eslint,
    resolveEslintArguments([]),
  );
}
