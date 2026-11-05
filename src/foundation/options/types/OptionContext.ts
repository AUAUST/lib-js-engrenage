export interface OptionContext<Sections> {
  get<Section extends keyof Sections>(
    section: Section,
  ): Promise<Sections[Section]>;
}
