import { createRolePreset } from "#project/roles/utils/createRolePreset";

// @debt a role preset, not a utility: it likely belongs in a role directory of its own rather than among `utils`
export const commands = createRolePreset({
  name: "commands",
  purpose: "One command's description, arguments and options, and the glue to its action.",
  file: ["*.ts"],
  exports: "default",
});
