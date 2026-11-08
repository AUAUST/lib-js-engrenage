export const syncTargetFlags = {
  tsconfig: {},
  aliases: {},
  agents: {},
  changesets: {},
  claude: {
    settings: "create .claude/settings.json when it is missing",
  },
  codex: {
    hooks: "create .codex/hooks.json when it is missing",
  },
  gitignore: {},
  globals: {},
  lefthook: {},
  package: {},
  pnpm: {},
  prettierignore: {},
  vscode: {
    settings: "create .vscode/settings.json when it is missing",
    extensions: "create .vscode/extensions.json when it is missing",
  },
  workflows: {},
  workspaces: {},
  publishing: {},
} as const satisfies Readonly<Record<string, Readonly<Record<string, string>>>>;
