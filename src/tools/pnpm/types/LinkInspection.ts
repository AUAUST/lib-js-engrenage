export interface LinkInspection {
  readonly path: string;
  readonly resolved: string | undefined;
  readonly present: boolean;
  readonly executablesHold: boolean;
  readonly holds: boolean;
}
