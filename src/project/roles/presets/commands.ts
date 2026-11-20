import { createRolePreset } from "#batiment/roles/index";

/**
 * Preset of the `commands` role: any `.ts` file, with one default export.
 */
export const commands = createRolePreset({
  name: "commands",
  purpose: "One command's description, arguments and options, and the glue to its action.",
  file: ["*.ts"],
  exports: "default",
});
