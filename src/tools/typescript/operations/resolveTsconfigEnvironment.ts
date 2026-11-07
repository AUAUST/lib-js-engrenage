import {
  binSection,
  scriptsSection,
  sourceSection,
  testsSection,
  toolingSection,
} from "#project/environments/index";
import type { LoadedConfig } from "#project/config/index";
import type { TsconfigEnvironment } from "#project/tsconfig/index";

export async function resolveTsconfigEnvironment(
  config: Pick<LoadedConfig, "resolve">,
  environment: TsconfigEnvironment,
) {
  switch (environment) {
    case "src": {
      return config.resolve(sourceSection);
    }
    case "tests": {
      return config.resolve(testsSection);
    }
    case "bin": {
      return config.resolve(binSection);
    }
    case "scripts": {
      return config.resolve(scriptsSection);
    }
    case "tooling": {
      return config.resolve(toolingSection);
    }
  }
}
