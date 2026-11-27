import type { Reporter } from "#foundation/reports/ports/Reporter";
import type { ReportLevel } from "#foundation/reports/types/ReportLevel";

export const verbosityLevels = [
  "silent",
  "important",
  "default",
  "info",
  "debug",
] as const;

export const reportLevels = {
  error: "important",
  warn: "important",
  log: "default",
  info: "info",
  debug: "debug",
} as const satisfies Record<keyof Reporter, ReportLevel>;
