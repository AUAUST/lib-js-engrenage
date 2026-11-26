import { runGateProcess } from "#project/gate/index";
import type { LoadedConfig } from "#project/config/index";
import type { GateStep } from "#workflows/gate/apis/GateStep";

export async function listCommandSteps(
  config: LoadedConfig,
): Promise<GateStep[]> {
  const { gate } = await config.resolve("agents");

  return gate.commands.map((command) => {
    return {
      audience: "agents",
      name: command,
      run() {
        return runGateProcess(config.context.root, "sh", ["-c", command]);
      },
    };
  });
}
