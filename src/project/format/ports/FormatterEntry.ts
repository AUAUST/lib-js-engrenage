import type { EntryShape } from "#foundation/extensions/index";
import type { Formatter } from "#project/format/ports/Formatter";
import type { PackageName } from "#types/PackageName";

export interface FormatterEntry extends EntryShape {
  readonly name: string;
  readonly package: PackageName;
  load(): Promise<Formatter>;
}

declare global {
  namespace Engrenage {
    interface Slots {
      "format.formatters": FormatterEntry;
    }

    interface Formatters {}
  }
}
