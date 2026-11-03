export interface OptionContext<Sections> {
  get<Section extends keyof Sections>(section: Section): Sections[Section];
}
