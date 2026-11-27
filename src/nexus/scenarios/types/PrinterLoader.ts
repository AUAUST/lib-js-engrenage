import type { MaybePromise } from "@auaust/toolkit/types";

import type { Printer } from "#nexus/reports/index";

/**
 * Loads a scenario's printer, importing it only once its scenario resolves.
 */
export type PrinterLoader = () => MaybePromise<Printer>;
