import type { Extension } from "#project/config/types/Extension";

export type ExtensionOption = Extension | readonly ExtensionOption[];
