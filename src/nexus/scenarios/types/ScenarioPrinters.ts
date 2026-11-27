import type { PrinterLoader } from "#nexus/scenarios/types/PrinterLoader";

/**
 * The printer loader of each scenario, by scenario name.
 */
export type ScenarioPrinters = Readonly<Record<string, PrinterLoader>>;
