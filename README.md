# gitcliff-config-nick2bad4u

[![NPM license.](https://flat.badgen.net/npm/license/gitcliff-config-nick2bad4u?color=purple)](https://github.com/Nick2bad4u/gitcliff-config-nick2bad4u/blob/main/LICENSE) [![NPM total downloads.](https://flat.badgen.net/npm/dt/gitcliff-config-nick2bad4u?color=pink)](https://www.npmjs.com/package/gitcliff-config-nick2bad4u) [![Latest GitHub release.](https://flat.badgen.net/github/release/Nick2bad4u/gitcliff-config-nick2bad4u?color=cyan)](https://github.com/Nick2bad4u/gitcliff-config-nick2bad4u/releases) [![GitHub stars.](https://flat.badgen.net/github/stars/Nick2bad4u/gitcliff-config-nick2bad4u?color=yellow)](https://github.com/Nick2bad4u/gitcliff-config-nick2bad4u/stargazers) [![GitHub forks.](https://flat.badgen.net/github/forks/Nick2bad4u/gitcliff-config-nick2bad4u?color=orange)](https://github.com/Nick2bad4u/gitcliff-config-nick2bad4u/forks) [![GitHub open issues.](https://flat.badgen.net/github/open-issues/Nick2bad4u/gitcliff-config-nick2bad4u?color=red)](https://github.com/Nick2bad4u/gitcliff-config-nick2bad4u/issues) [![Codecov.](https://flat.badgen.net/codecov/github/Nick2bad4u/gitcliff-config-nick2bad4u?color=blue)](https://codecov.io/gh/Nick2bad4u/gitcliff-config-nick2bad4u) [![Repo Checks.](https://flat.badgen.net/github/checks/Nick2bad4u/gitcliff-config-nick2bad4u?color=green)](https://github.com/Nick2bad4u/gitcliff-config-nick2bad4u/actions)

Shared [`git-cliff`](https://git-cliff.org/) changelog configuration for Nick2bad4u repositories.

The package ships:

- `cliff.toml`, the reusable changelog template and commit parser configuration.
- `presets/*.toml`, 17 standalone alternative layouts using the same parser.
- `docs/examples/*.md`, deterministic rendered output for every preset.
- A small JavaScript API for discovering published preset filenames.

## Install

```bash
npm install --save-dev gitcliff-config-nick2bad4u git-cliff
```

`git-cliff` is a peer dependency because the consuming repository should control its CLI version. Use git-cliff `2.10.0` or newer; this config uses the commit statistics and release context fields added in that line.

## Preset Styles

Use the default `cliff.toml` for this package's full GitHub-oriented changelog.
Alternative styles include GitHub, GitLab, Azure DevOps, Keep a Changelog,
Cocogitto, detailed, minimal, scoped, scope-sorted, statistics, unconventional,
user-facing-only, monorepo, dependency-audit, and chronological-ledger views.

For example:

```bash
git cliff --config node_modules/gitcliff-config-nick2bad4u/presets/minimal-user-facing.toml --github-repo Nick2bad4u/my-package --unreleased
```

See the [preset selection and provider guide](docs/PRESETS.md) for the complete
matrix, exact filtering rules, GitHub/GitLab/Azure setup, and maintainer workflow.
The [rendered examples index](docs/examples/README.md) shows the exact offline
output produced by every preset from the same deterministic tagged history.

## Recommended Scripts

Add these scripts to consuming repositories:

```json
{
 "scripts": {
  "changelog:generate": "git cliff --config node_modules/gitcliff-config-nick2bad4u/cliff.toml --github-repo Nick2bad4u/my-package --output CHANGELOG.md",
  "changelog:preview": "git cliff --config node_modules/gitcliff-config-nick2bad4u/cliff.toml --github-repo Nick2bad4u/my-package --unreleased",
  "changelog:preview:offline": "git cliff --config node_modules/gitcliff-config-nick2bad4u/cliff.toml --github-repo Nick2bad4u/my-package --unreleased --offline",
  "changelog:release-notes": "git cliff --config node_modules/gitcliff-config-nick2bad4u/cliff.toml --github-repo Nick2bad4u/my-package --current"
 }
}
```

Do not pass `--strip all` for release notes. The shared release-notes command intentionally emits the full rendered changelog section.

## GitHub Metadata

The template renders GitHub-style release sections, release comparison notes, PR links, and first-time contributors. PR and contributor data requires git-cliff's GitHub integration, so keep release generation online and set `GITHUB_TOKEN` in CI to avoid unauthenticated rate limits.

Use `--offline` for deterministic local previews or template validation. Offline renders still validate the Tera template and repository links, but GitHub-only data such as first-time contributors is omitted.

## Repository Links

The TOML file contains this package's repository as a fallback so it can generate its own changelog. In other repositories, pass the consuming repository explicitly with `--github-repo owner/repo`.

In GitHub Actions, set `GITHUB_REPO` once and omit `--github-repo` from the scripts:

```yaml
env:
 GITHUB_REPO: "${{ github.repository }}"
```

Then use scripts like:

```json
{
 "scripts": {
  "changelog:generate": "git cliff --config node_modules/gitcliff-config-nick2bad4u/cliff.toml --output CHANGELOG.md",
  "changelog:preview": "git cliff --config node_modules/gitcliff-config-nick2bad4u/cliff.toml --unreleased",
  "changelog:preview:offline": "git cliff --config node_modules/gitcliff-config-nick2bad4u/cliff.toml --unreleased --offline",
  "changelog:release-notes": "git cliff --config node_modules/gitcliff-config-nick2bad4u/cliff.toml --current"
 }
}
```

## Template Preview And Validation

git-cliff renders `cliff.toml` with Tera. This package has no separate validator; the practical validation path is rendering a preview:

```bash
npm run changelog:preview:offline
```

If the TOML or Tera template is invalid, git-cliff exits non-zero. Use `npm run changelog:preview` when you also want to inspect GitHub PR and first-time contributor metadata.

## Maintenance

Use [docs/UPDATE_CHECKLIST.md](docs/UPDATE_CHECKLIST.md) when publishing a new version of this config or refreshing repositories that consume it.
