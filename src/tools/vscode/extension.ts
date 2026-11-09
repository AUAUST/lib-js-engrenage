import type { Extension } from "#project/config/index";

export default {
  name: "tools/vscode",
  owns: {
    keys: {
      vscode: {
        input: "vscode",
        async load() {
          const { vscodeSection } =
            await import("#tools/vscode/config/sections/vscodeSection");

          return vscodeSection;
        },
      },
    },
  },
} satisfies Extension;
