# Discarded solutions

- skill traits (#277): share the analyser's depth with the debugger and planner — sync cannot add trait blocks yet; global `analysis` section instead
- init step for `.ai/discarded.md`: create the log with the project — agents create it on first entry, no tooling needed
- shared drafts fragment: one drafts protocol for planner, debugger and analyser — a `paths` rule loads too late, a default rule loads for every agent; copied until #277
- structure nested walker: walker reading the nested declaration child by child (#322) — rewrites the walker and resolvers for no behavior change; flattening at the boundary keeps them
- structure flat declarations: keeping `namespaces` and `domains` beside `structure` (#322) — two shapes for one concept and a merge check between them
- lazy declaration declarer: recursive option declarations in `foundation/options` (#322) — one consumer; kept private in `declareStructureNodes`
- optional structure wrapper: `structure` optional without child records accepting `undefined` (#322) — no declarer wraps an object declaration with its own optionality; debt marker instead
- layout plugin text edits: assignments kept beside `=` (#418) — joining `=⏎` cannot break the `rhs` again; printer override instead
- `operator-linebreak`: assignments kept beside `=` (#418) — no working fix, fights Prettier
- `dprint-plugin-typescript`: assignments kept beside `=` (#418) — formatter swap, no assignment option found
- Prettier fork: assignments kept beside `=` (#418) — maintenance cost; printer override instead
- no-unnecessary-type-parameters: skip reports on functions without a return annotation — silences single-use parameters the inferred return never uses; the rule now reads the checker's return type instead
- declareSection `Config` removal: silence its single-use report — a `config: Resolver` parameter makes `ConfigResolver` annotations circular and loses the default for unannotated sections
- reusable checks workflow: share the jobs between ci.yml and publish.yml — sync only updates existing workflow files, so consumers would never receive a new one
- build.outDir artifact path: pass only the build output to the release job — unreadable before engrenage is installed, which breaks init; the whole built tree is uploaded instead
- tests sharding as the fix for slow tests: CI under 2 minutes — hides the engrenage test suite's own slowness, which toolkit's 2k tests in under 1 minute show; sharding kept only as a config option
- side-effect import of sub-domain extensions: keep their `declare global` in dist declarations — duplicates the value import, fails `auaust/no-duplicates`, and every parent must remember it
- named-match-values export style: helper types beside helpers (#433) — type axis could not be constrained anywhere
