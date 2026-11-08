import { defineLazyCommand } from "#workflows/cli/index";

export default defineLazyCommand({
  configure(command) {
    return command
      .description("Compare the pnpm range of engrenage with the newest pnpm.")
      .option("--check", "fail when pnpm is two or more majors ahead", false);
  },
  action() {
    return import("#scripts/actions/pnpm");
  },
});
