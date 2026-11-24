import { createProjectConfig, type LoadedConfig } from "#project/config/index";
import type { Directory } from "#types/Directory";

/**
 * Loads the project at `root` from `input`, its defaults from a preset
 * returning `preset`.
 */
export function createPresetConfig({
  root,
  preset,
  input,
}: {
  root: Directory;
  preset: Readonly<Record<string, unknown>>;
  input: Readonly<Record<string, unknown>>;
}): LoadedConfig {
  const fixture = {
    name: "preset-fixture",
    contributes: {
      presets: [
        {
          name: "fixture",
          traits: [],
          load() {
            return Promise.resolve(preset);
          },
        },
      ],
    },
  };

  return createProjectConfig({
    root,
    raw: {
      extensions: [fixture],
      preset: "fixture",
      ...input,
    },
    configFile: undefined,
  });
}
