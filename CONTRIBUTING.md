# Contributing

## Updating `igniteui-webcomponents`

Whenever the `igniteui-webcomponents` package version is bumped (in either
`package.json` or `playground/package.json`), the Ignite UI AI skills stored
under `.claude/skills/` must also be refreshed so that Copilot and other AI
agents have up-to-date API knowledge.

Run the following command from the repository root **after** updating the
package version and running `npm install`:

```sh
npm install -g igniteui-cli@latest   # ensure the CLI is up to date first
ig ai-config
```

The `ig ai-config` command is provided by
[**igniteui-cli**](https://github.com/IgniteUI/igniteui-cli) and regenerates
the skill configuration files under `.claude/skills/` with the component API
reference, CSS parts, events, and design-token data that matches the newly
installed [`igniteui-webcomponents`](https://github.com/IgniteUI/igniteui-webcomponents)
version.

> **Always use the latest `igniteui-cli`** before running `ig ai-config`.
> Older CLI versions may not know about new API surface areas introduced in
> recent `igniteui-webcomponents` releases, which would produce incomplete or
> incorrect skill files.

> **Why?** The skills are built from the published API of
> `igniteui-webcomponents`. If they fall out of sync with the installed
> version, AI suggestions may reference properties, parts, or events that no
> longer exist or miss newly added ones.

### Step-by-step checklist

1. Update the `igniteui-webcomponents` version in the relevant `package.json`.
2. Run `npm install` (or `npm install` inside `playground/` if updating that
   one) to lock the new version.
3. Run `ig ai-config` from the repository root to regenerate the skills.
4. Commit both the `package-lock.json` changes **and** any updated files under
   `.claude/skills/` in the same PR.
