import { freeze } from "@auaust/toolkit/object";

import { engrenage } from "#constants";
import type { BlockSyntax } from "#types/BlockSyntax";
import type { File } from "#types/File";

export const markdownBlocks = freeze({
  open: "<!-- ",
  close: " -->",
  padding: "\n\n",
} as const) satisfies BlockSyntax;

export const agentsFile = "AGENTS.md" satisfies File;

export const agentsTemplate = `${engrenage}/agents/templates/${agentsFile}`;

export const agentNames = freeze(["claude", "codex"] as const);

export const backlogIndex = ".ai/backlog/index.md" satisfies File;

export const legacyBacklog = ".claude/backlog.md" satisfies File;

export const backlogTemplate = `${engrenage}/agents/templates/backlog.md`;

export const scratchpadFile = ".ai/scratchpad.md" satisfies File;

export const scratchpadPlaceholders = freeze([
  "UwU, drop your widdle dev dreams here and the sparkly backlog bun-bun will tuck them into tiny actionable blankies! 🌸🐰✨",
  "Pwease feed this smol idea basket your chaotic brain sprinkles, precious code bean, nyaaa~! 🧺🍓💖",
  "Your next genius scribble deserves a teeny strawberry throne right here, senpai, so plop it down with extra uwu! 🍓👑✨",
  "Hewwooo, esteemed keyboard warrior, leave a baby thought for the marshmallow planning fairies to kiss into a task! 🧚🍡💕",
  "This fluffy little TODO nest is awaiting your most fearsome engineering concerns with itsy-bitsy heart-shaped mittens, nya~! 🪺🧤💗",
  "Scribble a wishie-wish here and our turbo-kawaii backlog hamster will carry it to task town in a cupcake carriage! 🐹🧁🌈",
  "O mighty architect-chan, bestow a crumb of developer wisdom upon this sparkly pudding of possibility, pweeease! 🍮🎀🥺",
  "Deposit your spicy code grumbles here for complimentary kitten cuddles and eventual actionable sparklefication, uwu deluxe! 🐱🌶️💞",
  "Beep-boop, your emotional support idea dumpling requests one freshly squished thought and seven billion tiny headpats! 🥟🤖💖",
  "Nyaa~ this empty page has put on its fanciest bunny ears just to welcome your next catastrophically adorable dev idea! 🐰🎀🌟",
] as const);
