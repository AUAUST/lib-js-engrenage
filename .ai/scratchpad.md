# Scratchpad

Because the libs in ts are Pascal.Cased, we should consider using that casing instead of the lowercase currently in place.
(i.e. we currently do `es2023.array` but should consider `ES2023.Array` as the canonical form)

===

## 1. Planner decisions to confirm

1. **Reading of "layers are metadata of namespaces"**

Yes, the root is considered a namespace for the purpose of layers; conceptually, the genuine root / and source root src/ are both namespaces; the first one describes the directionality of tests, src, data, bin and script; the latter organizes the source code itself. This doesn't **have** to be implemented like that, but this **may** and it is consistent with the general mental model. And yes, it's reasonable to expect domains not to be grouped directly; all domains sitting at the same layer are considered peers within that layer.

2. **Where "empty role directory fails" runs**

Skip the check entirely. An empty directory should simply be ignored, manually deleted by the user if necessary as untracked anyways.

3. **Library versus app is a trait, `published`**

Yes. The mapping of preset to traits and traits to behaviour is well-defined and consistent. We should also be able to use specific traits in a config if a combination of presets doesn't cover the use case. If approached like this, consider making presets unique? One base preset max that defines all the relevant traits; then, traits could be a managed list option which allows adding, removing or overriding traits. Tho the latter wouldn't make much sense combined with a preset.

4. **`roles` at two levels**

Agreed on all.

5. **`bin` has no roles**

Confirmed. bin has no role.

6. **`ports/` holds only injected interfaces**

Yes. Additionally, a port should only export one type that matches its filename. It doesn't have to be enforced as an interface; a type works and, if helpful for any reason, also allows re-exporting another type as a port. If it must be composed, the components should still be in types/. Ports are exactly one type that defines the contract to implement. This might add the necessity to make types/ public as well, as otherwise it might complicated to reference the components from outside the domain. Alternativelly, re-export the components from the port itself tho it blurs which type is the contract and loosens the encapsulation.

7. **Tests mirror the tested environment's layout**

Yes.

8. **`#tooling` is a root alias**

Yes to "root aliases for code environments only + #data in apps"

9. **How aliases reach TypeScript and Vite**

Yes. `tsdown` supports paths as well, so it also respects the same alias configuration. dist-testing must however ensure not to resolve these aliases, given they don't exist for consumers.

10. **`engrenage structure --check` fails only on `strict` environments; `--json` when a consumer needs it**

Yes.

11. **Tree order**

Ok.

12. **"Tiered registry" renamed "layered registry"** (#143), following the namespace and layer vocabulary.

Agreed.

13. **"Public" roles are public inside the project, not package exports**

Yes.

14. **The interim test-import rule and the preset check in #155**

Ok.

===

## 2. Questions

### Name of engrenage’s operations role

Go with operations.

### Off-by-default catalogue

Go with the recomendations, add ports and adapters.

### A `data/` role for static, domain-scoped resources

Leave if for projects to define. Also resolves the "what should data/ accept as file types" question.

### What "inferred" means for layers

Go with the recommendation, leave C out to avoid a worker trying to add it directly.

### Role contract field names

Yes to the naming. For nested roles in structured roles, how to handle custom structure? Typically, gql's queries, mutations and such should only exist within gql. Do we define split definition from activation, so we can define roles that are only activated within their respective structures? Or do we define the nested roles as either their name for known roles or inline role object otherwise?

This also helps in defining the handling of ui/ in Shopify Extensions: ui/ becomes a specific role directory or namespace which contains special roles and structures relevant to the UI layer only.

Yes for `file` vs `accepts`.

### Workspaces

Mapping to environments: Yes to the one-env-per-glob. In Shopify, we can get around the different roles and structures of functions vs extensions vs app by having separate globs for each, even if all globs reside in extensions. i.e. `extensions/functions-*` would support a different structure than `extensions/action-*`.

Shared code across workspaces: Only aliases for now. The #self reference should still be added to the workspace package.json: `{ "json": { "imports": { "#self/*": { "types": [ "./src/*.ts", "./src/*.tsx" ], "default": "./src/*" } } } }`

Generated package.json keys: Yes, + the above, + name from a pattern that supports the dirname interpolation

Boundaries between workspaces: Yes, enforce explicit dep.

Tool discovery: Yes.

#53: Go for the simplest approach.

### Generated rule set and severities

Yes for the recommended approach; all is an error.

## Pitfalls

Cycles are not reliably caught at runtime: keep without enforcement, skip the check command as well.

Bundler aliases in src break Node-run consumers: yes to the aliases only in bundler environments. In such cases, scripts and bin should benefit from using the aliases as well given they cannot work anyways if source files are not properly resolved. This likely means that aliases can be defined exactly once in the solution tsconfig, where the only explicit disablement is for dist testing that explicitely has no alias at all.

Layer and privacy enforcement is unverified: the prototyping step should be implemented first by a debugger agent rather than a worker so it investigates more deeply. If it happens to fail, we'll review the approach and adjust the enforcement mechanism accordingly. No need to prematurely define a solution we might never need.

Test variants need every test glob updated: the config must split components: instead of one glob for all, it should provide a "location" glob (`**/*`), a "suffix" glob (`.{spec,test}`) and an "extension" glob (`.{ts,tsx}`). The globs are then combined to form the complete test file pattern, including the necessary variants for dist-vs-source testing. This way, a project might still describe precise locations, decide on spec over test, add extensions as needed.

#156 needs the description implemented: yes for your recommendation.

Default roles leave impure code homeless: yes, we should have a "role-defining" init step. It must remain minimal tho, mostly as an example to how to define roles and hint that it's a feature. I'd also recommend having a way to purely opt-out of roles. I.e. disable the role system entirely, which means eslint doesn't spin up, no role checks are enforced, and the project is free to be structured in any way it wants while benefiting from the rest of engrenage.
