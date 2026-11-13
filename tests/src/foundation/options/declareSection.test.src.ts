import { describe, expectTypeOf, test } from "vitest";

import { declareSection } from "#foundation/options/config/declarers/declareSection";
import type { Section } from "#foundation/options/ports/Section";
import type { ConfigResolver } from "#project/config/types/ConfigResolver";

describe("declareSection", () => {
  test("types the resolver from the section's annotation", () => {
    const probe = declareSection({
      async resolve(_input, config: ConfigResolver): Promise<boolean> {
        return (await config.resolve("traits")).published;
      },
    });

    expectTypeOf(probe).toEqualTypeOf<Section<boolean>>();
  });

  test("rejects an annotation that is no resolver", () => {
    declareSection({
      // @ts-expect-error -- a config without `resolve` fails the `Config` constraint
      resolve(_input, config: { readonly context: number }) {
        return config.context;
      },
    });
  });
});
