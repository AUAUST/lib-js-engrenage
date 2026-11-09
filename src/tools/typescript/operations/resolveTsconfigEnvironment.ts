import type { LoadedConfig } from "#project/config/index";
import type { TsconfigEnvironment } from "#project/tsconfig/index";

export async function resolveTsconfigEnvironment(
  config: Pick<LoadedConfig, "resolve">,
  environment: TsconfigEnvironment,
) {
  switch (environment) {
    case "src": {
      return config.resolve("src");
    }
    case "tests": {
      return config.resolve("tests");
    }
    case "bin": {
      return config.resolve("bin");
    }
    case "scripts": {
      return config.resolve("scripts");
    }
    case "tooling": {
      return config.resolve("tooling");
    }
  }
}
