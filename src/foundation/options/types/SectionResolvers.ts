import type { OptionContext } from "#foundation/options/types/OptionContext";

export type SectionResolvers<Sections> = {
  [Section in keyof Sections]: (
    get: OptionContext<Sections>["get"],
  ) => Sections[Section] | Promise<Sections[Section]>;
};
