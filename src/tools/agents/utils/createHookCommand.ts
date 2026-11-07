export function createHookCommand(command: string): string {
  return `engrenage_hook_root="$(node -e 'const fs=require("node:fs"),p=require("node:path");let d=process.cwd();while(!fs.existsSync(p.join(d,"package.json"))){const n=p.dirname(d);if(n===d)throw Error("No consumer package found");d=n}process.stdout.write(d)')" && cd -- "$engrenage_hook_root" && ${command} || exit 2`;
}
