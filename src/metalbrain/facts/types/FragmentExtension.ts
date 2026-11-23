/**
 * An active extension as fragment rendering sees it: its name, which `@extension`
 * blocks test, and the package root shipping its fragments.
 */
export interface FragmentExtension {
  readonly name: string;
  readonly root?: URL | undefined;
}
