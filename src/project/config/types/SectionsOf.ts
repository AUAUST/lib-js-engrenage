import type { UnionToIntersection } from "@auaust/toolkit/types";

import type { Extension } from "#project/config/types/Extension";
import type { ExtensionSections } from "#project/config/types/ExtensionSections";

export type SectionsOf<Builtins> = UnionToIntersection<
  {
    readonly [
      Name in keyof Builtins
    ]: Builtins[Name] extends readonly (infer Item extends Extension)[]
      ? ExtensionSections<Item>
      : Builtins[Name] extends Extension
        ? ExtensionSections<Builtins[Name]>
        : never;
  }[keyof Builtins]
>;
