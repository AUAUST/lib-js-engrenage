import { packages } from "#constants";
import { runGateBinary, type GateResult } from "#project/gate/index";
import { resolveTscArguments } from "#tools/typescript/operations/resolveTscArguments";
import { describeUncheckedInstances } from "#tools/typescript/utils/describeUncheckedInstances";
import type { LoadedConfig } from "#project/config/index";

export async function checkTypes(config: LoadedConfig): Promise<GateResult> {
  const { runs, skipped } = await resolveTscArguments(config, []);

  const results = await Promise.all(
    runs.map((args) => {
      return runGateBinary(
        config.context.root,
        packages.typescript,
        args,
        "tsc",
      );
    }),
  );

  const failed = results.filter(({ ok }) => !ok);
  const warnings = describeUncheckedInstances(skipped);

  return {
    ok: failed.length === 0,
    output: failed.map(({ output }) => output).join("\n"),
    ...(warnings === undefined ? {} : { warnings }),
  };
}
