import { ensureIncludes, hasNodeCondition } from "#foundation/processes/index";
import { sourceCondition } from "#project/package/constants";
import { nativeConfigLoader } from "#tools/vite/constants";

// @debt repeats `ensureSourceConfigLoader` of `#tools/vitest`, as Vite's domain surface loads the `vite` package
export default function (args: string[]): readonly string[] {
  if (hasNodeCondition(sourceCondition)) {
    ensureIncludes(args, nativeConfigLoader);
  }

  return args;
}
