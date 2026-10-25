import { join, basename } from "node:path";
import "node:process";
import { readFileSync } from "node:fs";

export const name = basename(join("a", "b"));
