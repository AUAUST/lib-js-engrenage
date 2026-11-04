import type { createPrompter } from "#cli/operations/createPrompter";

export interface Prompter extends ReturnType<typeof createPrompter> {}
