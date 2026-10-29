# AGENTS.md

Instructions for AI agents working in this repository. People: see `CONTRIBUTING.md`.
Using the package from another repo? Read `llms.txt` instead.

## What this is

`igniteui-astro-components`: the Astro components, layout, plugins and styles behind the
Infragistics docs sites (igniteui-documentation, api-docs, the blog). No build step: `src/`
is published as-is and consumers compile it. Node >= 22.12, npm only.

## Commands

```sh
npm ci                      # install (husky hooks via `prepare`)
npm test                    # node --test scripts/**/*.test.mjs (includes the llms drift test)
npm run lint                # oxlint
npm run format:check        # prettier
npm run playground          # dev site on http://localhost:4567 rendering every component
npm run playground:check    # astro check over src/ through the playground
npm run build:llms          # regenerate llms-full.txt after touching any README or exports
```

Run `npm test`, `npm run lint` and `npm run playground:check` before opening a PR.

## Layout

- `src/components/<Name>/` — `<Name>.astro`, `<Name>.scss`, `README.md`; MDX content components in `src/components/mdx/<Name>/`.
- `src/layouts/DocsLayout/` — the page shell. `src/lib/` — shared types and helpers. `src/plugins/` — remark/rehype plugins. `src/scripts/` — client scripts. `src/chrome/` — marketing header/footer snapshot integration. `src/styles/theme.scss` — the only stylesheet; tokens in `src/styles/global/_variables.scss`.
- `package.json#exports` is the public surface. A file not listed there is private.
- `playground/` — in-repo Astro site; `playground/src/middleware.ts` and `playground/astro.config.mjs` show what a host must provide.
- `scripts/` — tests (`*.test.mjs`) and `build-llms.mjs`.

## Conventions

- `export interface Props` at the top of every `.astro` file, with a JSDoc line per prop. The README beside it must list the same props.
- Colours, spacing and fonts come from `--igd-*` custom properties; never hard-code them.
- Formatting is Prettier's; the pre-commit hook formats staged files, so do not reformat files you did not change.
- Commits: Conventional Commits with a scope, e.g. `feat(sample): …`, `fix(styles): …`, `docs: …`, `chore(github): …`. Branches: `<user>/<topic>`. Base branch: `master`.
- Do not add dependencies without saying so in the PR; peer dependencies change what every consumer must install.

## Adding or changing a component

1. `src/components/<Name>/<Name>.astro` + `<Name>.scss` + `README.md` (template in `CONTRIBUTING.md`).
2. Add the subpath to `package.json#exports`.
3. Add a row to the tables in `README.md` and a line to `llms.txt`.
4. Add or update a playground page under `playground/src/pages/components/` and the entry in `playground/src/site-config.ts`.
5. `npm run build:llms`, then commit `llms-full.txt` with the change.
6. Logic that lives in a `.ts` file gets a test in `scripts/`.

## Filing issues

- Search existing issues first. Docs _content_ problems go to IgniteUI/igniteui-documentation, not here.
- Prefer the web forms (Bug report, Feature request, Accessibility). `gh issue create` bypasses YAML forms, so reproduce them: title prefix `[Bug]: `, `[Feature]: ` or `[A11y]: `; label `:bug: bug`, `:screwdriver: enhancement` or `:wheelchair: a11y`; add `Component: <Name>` or `Area: <area>`; body headings `### What happened?`, `### Steps to reproduce`, `### Where did you see it?` (bug) or `### Problem`, `### Proposed solution` (feature).

## Opening PRs

The "PR template" check requires: text under `## Summary`; `Closes #N` / `Part of #N` or the words `No issue` under `## Related issue`; at least one `- [x]` under `## Type of change`; and `## Consumer impact` filled when "Breaking change" is ticked. `gh pr create` does not apply the template, so pass `--body-file` with this skeleton:

```md
## Summary

<what and why, two sentences>

## Related issue

No issue

## Type of change

- [x] Documentation or playground only

## Consumer impact

None.
```

## Do not

- Edit `llms-full.txt` by hand (generated), or commit `playground/public/api-search-index/*.json`.
- Publish to npm or bump `package.json#version`: a GitHub Release with tag `X.Y.Z` (no `v`) runs the release workflow, which sets the version from the tag.
- Touch consumer repos from here; they pin a published version and upgrade on their own schedule.
