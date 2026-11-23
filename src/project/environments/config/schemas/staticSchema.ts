import { declareNamespaceKind } from "#batiment/scopes/index";
import {
  declareList,
  declareObject,
  directorySchema,
} from "#foundation/options/index";
import { defaultStaticDirectories } from "#project/environments/constants";
import type { ResolvedTraits } from "#project/presets/index";

export const staticSchema = declareObject(
  {
    kind: declareNamespaceKind(),
    dirs: declareList(directorySchema, {
      description: "Directories of files served as-is and fetched at runtime by URL, never imported by code; Vite takes a single one as its `publicDir`.",
      optional: { value: defaultStaticDirectories },
    }),
  },
  {
    description: [
      "The static environment.",
      "`false` serves no static directory.",
    ],
    optional: {
      explain: "disabled when the project is `published`",
      compute(context: { traits: ResolvedTraits }) {
        return context.traits.published ? false : {};
      },
    },
    disable: {
      value: {
        dirs: [],
      },
    },
  },
);
