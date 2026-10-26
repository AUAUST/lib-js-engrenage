import type { createPrompter } from "#support/scaffold/utils/createPrompter";

export interface Prompter extends ReturnType<typeof createPrompter> {}
