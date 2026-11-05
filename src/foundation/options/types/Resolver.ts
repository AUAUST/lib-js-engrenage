import type { Section } from "#foundation/options/types/Section";

export interface Resolver<Context = unknown> {
  readonly context: Context;
  resolve<Output>(section: Section<Output>): Promise<Output>;
}
