import { stateDirectory } from "#project/config/constants";
import type { Extension } from "#project/config/types/Extension";
import type { FileLocation } from "#project/config/types/FileLocation";

/**
 * The `project/config` extension: owns the `extensions` and `resources` keys and
 * the `state` directory resource.
 */
export default {
  name: "project/config",
  owns: {
    keys: {
      extensions: {
        input: "extensions",
        async load() {
          const {
            extensionsSection,
          } = await import("#project/config/config/sections/extensionsSection");

          return extensionsSection;
        },
      },
      resources: {
        async load() {
          const {
            resourcesSection,
          } = await import("#project/config/config/sections/resourcesSection");

          return resourcesSection;
        },
      },
    },
    files: {
      // @debt each `state.<artefact>` locates itself from `stateDirectory` since `locate` cannot read `resources`; the resolver could locate a dotted resource inside its parent's directory instead
      state: {
        title: "Engrenage state",
        locate(): FileLocation {
          return { directory: stateDirectory };
        },
      },
    },
  },
} satisfies Extension;
