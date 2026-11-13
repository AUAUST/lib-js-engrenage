import type { EntryShape } from "#foundation/extensions/index";
import type { Formatter } from "#project/format/ports/Formatter";
import type { PackageName } from "#types/PackageName";

export interface FormatterEntry extends EntryShape {
  /**
   * The `format.formatter` value selecting this formatter.
   */
  readonly name: string;
  // @debt `package` is validated but read by no consumer, so its contract beyond naming the formatter's package is unknown
  readonly package: PackageName;
  /**
   * Loads the formatter, which resolves `undefined` for a file it does not
   * format.
   */
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
