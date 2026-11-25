import type { LoadedConfig } from "#project/config/index";

export async function fillCompass(config: LoadedConfig): Promise<string> {
  const { compass = "" } = await config.resolve("agents");

  return compass;
}
