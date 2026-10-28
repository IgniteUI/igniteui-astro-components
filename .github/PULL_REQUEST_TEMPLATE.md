<!--
Keep every section and heading below: the "PR template" check fails the PR
when a required section is missing or empty, or a required checkbox is not
ticked. Lines like this one are comments and are ignored.
-->

## Summary

<!-- One or two sentences: what changes and why. -->

## Related issue

<!-- "Closes #123", "Part of #123", or "No issue: <one-line justification>". Required. -->

## Type of change

<!-- Tick one or more. -->

- [ ] Bug fix
- [ ] New feature or component
- [ ] Styles / theming / tokens
- [ ] Documentation or playground only
- [ ] Refactor, tooling or dependency update
- [ ] Breaking change (consumer sites need to change something — describe it under Consumer impact)

## What changed

<!-- Bullet list of the actual changes: files, exports, tokens, behaviour. -->

## How to test

<!-- Steps a reviewer can follow on the playground or a docs site. -->

## Consumer impact

<!--
The published package is consumed by the docs sites, api-docs and the blog.
State what a consumer must do after upgrading: nothing / bump + no changes /
config or markup change (describe) / follow-up PR in <repo>.
-->

## Screenshots

<!-- Required for any visual change: before/after, light and dark theme. Write "N/A" otherwise. -->

## Checklist

- [ ] `npm test`, `npm run lint`, `npm run format:check` and `npm run playground:check` pass locally
- [ ] `npm run playground:build` succeeds
- [ ] The playground has a page or section demonstrating the change (new or updated)
- [ ] README / component README updated for any new export, prop, token or default
- [ ] Verified in light and dark page theme
- [ ] Keyboard and screen-reader behaviour checked for any interactive change (or N/A)
- [ ] No new `!important`, hard-coded colours outside `palette.ts` / `_variables.scss`, or leftover debug code
