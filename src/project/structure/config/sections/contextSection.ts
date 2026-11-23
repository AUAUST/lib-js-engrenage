import { load, type LoadedContext } from "#batiment/context/index";
import { declareSection } from "#foundation/options/index";
import { createResolverContext } from "#project/structure/adapters/createResolverContext";
import type { ConfigResolver } from "#project/config/index";

// @debt the adapter reads through this section's resolver after the section settles, untracked: a key cycle through it hangs instead of failing, and live keys it reads never mark its readers stale
export const contextSection = declareSection({
  resolve(_input, config: ConfigResolver): LoadedContext {
    return load(createResolverContext(config), config.context.filesystem);
  },
});
