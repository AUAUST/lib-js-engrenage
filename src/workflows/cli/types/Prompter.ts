import type { createPrompter } from "#cli/utils/createPrompter";

export interface Prompter extends ReturnType<typeof createPrompter> {}
