import type { Extension } from "#project/config/types/Extension";
import type { KeyDeclaration } from "#project/config/types/KeyDeclaration";

/**
 * The resolved section of each config key `E` owns, by key; empty for an extension
 * owning no key.
 *
 * @stable
 */
export type ExtensionSections<E extends Extension> = E extends {
  readonly owns: { readonly keys: infer Keys };
}
  ? {
      readonly [Key in keyof Keys]: Keys[Key] extends KeyDeclaration<
        infer Output
      >
        ? Output
        : never;
    }
  : Readonly<Record<never, never>>;
