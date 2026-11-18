export function createHookCommand(
  command: string,
  payloadIncludes?: string,
): string {
  const run = `engrenage_hook_root="$(node -e 'const fs=require("node:fs"),p=require("node:path");let d=process.cwd();while(!fs.existsSync(p.join(d,"package.json"))){const n=p.dirname(d);if(n===d)throw Error("No consumer package found");d=n}process.stdout.write(d)')" && cd -- "$engrenage_hook_root" && ${command} || exit 2`;

  if (payloadIncludes === undefined) {
    return run;
  }

  const pattern = `'${payloadIncludes.replaceAll("'", `'\\''`)}'`;

  return `engrenage_hook_payload="$(cat)"; case "$engrenage_hook_payload" in *${pattern}*) ;; *) exit 0 ;; esac; printf '%s' "$engrenage_hook_payload" | { ${run}; }`;
}
