import { command, option } from "#nexus/cli/index";

export default command({
  name: "pnpm",
  description: "Compare the pnpm range of engrenage with the newest pnpm.",
  options: [
    option({
      name: "check",
      type: "boolean",
      description: "fail when pnpm is two or more majors ahead",
      default: false,
    }),
  ],
  action() {
    return import("#scripts/actions/pnpm");
  },
});
