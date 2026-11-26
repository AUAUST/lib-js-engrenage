import { ensureIncludes, hasNodeCondition } from "#foundation/processes/index";
import { sourceCondition } from "#project/package/constants";
import { nativeConfigLoader } from "#tools/vite/constants";

// @debt loads the config natively only under the source condition, where `ensureNativeConfigLoader` of `#tools/vitest` does whenever Node strips types, and repeats it outside `#tools/vite` as that surface loads the `vite` package
export default function (args: string[]): readonly string[] {
  if (hasNodeCondition(sourceCondition)) {
    ensureIncludes(args, nativeConfigLoader);
  }

  return args;
}
