import type { createPrompter } from "#workflows/cli/operations/createPrompter";

export interface Prompter extends ReturnType<typeof createPrompter> {}
