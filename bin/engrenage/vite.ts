import { packages } from "#constants";
import { defineToolCommand } from "#workflows/cli/index";

export default defineToolCommand({
  name: "vite",
  description: "Run Vite.",
  packageName: packages.vite,
});
