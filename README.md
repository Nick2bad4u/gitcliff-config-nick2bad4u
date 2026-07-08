# gitcliff-config-nick2bad4u

[![NPM license.](https://flat.badgen.net/npm/license/gitcliff-config-nick2bad4u?color=purple)](https://github.com/Nick2bad4u/gitcliff-config-nick2bad4u/blob/main/LICENSE) [![NPM total downloads.](https://flat.badgen.net/npm/dt/gitcliff-config-nick2bad4u?color=pink)](https://www.npmjs.com/package/gitcliff-config-nick2bad4u) [![Latest GitHub release.](https://flat.badgen.net/github/release/Nick2bad4u/gitcliff-config-nick2bad4u?color=cyan)](https://github.com/Nick2bad4u/gitcliff-config-nick2bad4u/releases) [![GitHub stars.](https://flat.badgen.net/github/stars/Nick2bad4u/gitcliff-config-nick2bad4u?color=yellow)](https://github.com/Nick2bad4u/gitcliff-config-nick2bad4u/stargazers) [![GitHub forks.](https://flat.badgen.net/github/forks/Nick2bad4u/gitcliff-config-nick2bad4u?color=green)](https://github.com/Nick2bad4u/gitcliff-config-nick2bad4u/forks) [![GitHub open issues.](https://flat.badgen.net/github/open-issues/Nick2bad4u/gitcliff-config-nick2bad4u?color=red)](https://github.com/Nick2bad4u/gitcliff-config-nick2bad4u/issues) [![Codecov.](https://codecov.io/gh/Nick2bad4u/gitcliff-config-nick2bad4u/branch/main/graph/badge.svg)](https://codecov.io/gh/Nick2bad4u/gitcliff-config-nick2bad4u)

Shared [`git-cliff`](https://git-cliff.org/) changelog configuration for Nick2bad4u repositories.

The package ships:

- `cliff.toml`, the reusable changelog template and commit parser configuration.

## Install

```bash
npm install --save-dev gitcliff-config-nick2bad4u git-cliff
```

`git-cliff` is a peer dependency because the consuming repository should control its CLI version. Use git-cliff `2.10.0` or newer; this config uses the commit and release statistics fields added in that line.

## Recommended Scripts

Add these scripts to consuming repositories:

```json
{
 "scripts": {
  "changelog:generate": "git cliff --config node_modules/gitcliff-config-nick2bad4u/cliff.toml --github-repo Nick2bad4u/my-package --output CHANGELOG.md",
  "changelog:preview": "git cliff --config node_modules/gitcliff-config-nick2bad4u/cliff.toml --github-repo Nick2bad4u/my-package --unreleased",
  "changelog:release-notes": "git cliff --config node_modules/gitcliff-config-nick2bad4u/cliff.toml --github-repo Nick2bad4u/my-package --current"
 }
}
```

Do not pass `--strip all` for release notes. The shared release-notes command intentionally emits the full rendered changelog section.

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
  "changelog:release-notes": "git cliff --config node_modules/gitcliff-config-nick2bad4u/cliff.toml --current"
 }
}
```

## Maintenance

Use [docs/UPDATE_CHECKLIST.md](docs/UPDATE_CHECKLIST.md) when publishing a new version of this config or refreshing repositories that consume it.
