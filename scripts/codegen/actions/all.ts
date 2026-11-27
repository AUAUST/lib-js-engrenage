import apis from "#scripts/codegen/actions/apis";
import config from "#scripts/codegen/actions/config";
import editions from "#scripts/codegen/actions/editions";
import rules from "#scripts/codegen/actions/rules";
import schemas from "#scripts/codegen/actions/schemas";

// @debt restates the generators the codegen group lists as subcommands, so a new generator joins both lists
export default async function (options: { check: boolean }): Promise<void> {
  await editions(options);

  await apis([], options);

  await config(options);

  await rules(options);

  await schemas(options);
}
