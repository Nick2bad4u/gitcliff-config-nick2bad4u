# Git-Cliff Presets

The package publishes `cliff.toml` as its default and 17 standalone alternative
configs under `presets/`. Every preset uses the same ordered classification
contract for hybrid Gitmoji headers, bracketed types, Conventional Commits,
dependency bots, security changes, reverts, and miscellaneous commits.

The presentation changes; the repository commit vocabulary does not.

## Choose A Preset

| Preset                             | Best For                              | Defining Output                                                               | Example                                           |
| ---------------------------------- | ------------------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------- |
| `azure-devops-keepachangelog.toml` | Azure DevOps projects                 | Keep a Changelog headings, PR attribution, contributors, and branch compares  | [Output](examples/azure-devops-keepachangelog.md) |
| `cocogitto.toml`                   | Scope-heavy engineering changelogs    | Scoped entries first, sorted by scope, with author and commit links           | [Output](examples/cocogitto.md)                   |
| `detailed.toml`                    | Engineering and release audits        | Bodies, authors, scopes, commit links, and per-commit diff statistics         | [Output](examples/detailed.md)                    |
| `github-keepachangelog.toml`       | Long-form GitHub changelogs           | Keep a Changelog plus PR and first-contributor enrichment                     | [Output](examples/github-keepachangelog.md)       |
| `github.toml`                      | GitHub release descriptions           | Flat GitHub-style bullets, PR titles, authors, contributors, and comparison   | [Output](examples/github.md)                      |
| `gitlab-keepachangelog.toml`       | GitLab projects                       | Keep a Changelog plus merge requests, contributors, and GitLab comparisons    | [Output](examples/gitlab-keepachangelog.md)       |
| `keepachangelog.toml`              | Conventional changelog files          | Dated releases and reference-style GitHub comparison links                    | [Output](examples/keepachangelog.md)              |
| `minimal.toml`                     | Compact complete release notes        | Version, groups, scopes, breaking markers, and subjects only                  | [Output](examples/minimal.md)                     |
| `scoped.toml`                      | Category-first component views        | Category headings containing nested scope headings                            | [Output](examples/scoped.md)                      |
| `scopesorted.toml`                 | Compact scope-oriented scans          | Category groups with flat scope-sorted bullets and unscoped entries last      | [Output](examples/scopesorted.md)                 |
| `statistics.toml`                  | Release health summaries              | Normal groups plus counts, timespan, commit convention, and linked references | [Output](examples/statistics.md)                  |
| `unconventional.toml`              | Raw or mixed commit histories         | Raw first-line subjects classified without Conventional Commit parsing        | [Output](examples/unconventional.md)              |
| `detailed-user-facing.toml`        | Full customer-facing release notes    | Detailed entries limited to behavior-changing categories                      | [Output](examples/detailed-user-facing.md)        |
| `minimal-user-facing.toml`         | Compact customer-facing release notes | Minimal entries limited to behavior-changing categories                       | [Output](examples/minimal-user-facing.md)         |
| `monorepo.toml`                    | Packages and multi-component repos    | Scope-first hierarchy with change categories nested per component             | [Output](examples/monorepo.md)                    |
| `dependency-audit.toml`            | Upgrade and security reviews          | Dependency and security changes only, with links and diff statistics          | [Output](examples/dependency-audit.md)            |
| `change-ledger.toml`               | Forensic or compliance review         | Chronological Markdown table with category, scope, author, commit, and diff   | [Output](examples/change-ledger.md)               |

The two user-facing presets include Features, Bug Fixes, Performance, Reverts,
and Security. They intentionally omit Refactor, Documentation, Styling, Testing,
Chores, CI/CD, Build System, Dependencies, and Other Changes.

`dependency-audit.toml` is the complementary maintenance view: it includes only
Dependencies and Security. `monorepo.toml` makes scope the primary hierarchy,
while `scoped.toml` makes change category the primary hierarchy.

## Use A Preset

Point git-cliff at the published file in `node_modules`:

```bash
git cliff --config node_modules/gitcliff-config-nick2bad4u/presets/minimal-user-facing.toml --github-repo Nick2bad4u/my-package --unreleased
```

Use the same path for release notes:

```bash
git cliff --config node_modules/gitcliff-config-nick2bad4u/presets/github.toml --github-repo Nick2bad4u/my-package --current
```

Do not pass `--strip all`; presets intentionally control their complete output.

The TOML files are package assets, not JavaScript package exports. Use their
filesystem paths under `node_modules` rather than importing them through
`package.json#exports`.

## Provider Setup

GitHub-oriented presets accept the package's normal repository selection:

```bash
git cliff --config node_modules/gitcliff-config-nick2bad4u/presets/github-keepachangelog.toml --github-repo owner/repository
```

You can set `GITHUB_REPO=owner/repository` instead. Set `GITHUB_TOKEN` when you
want online pull request and contributor enrichment; add `--offline` for
deterministic local rendering.

The GitLab preset uses GitLab's repository selector:

```bash
git cliff --config node_modules/gitcliff-config-nick2bad4u/presets/gitlab-keepachangelog.toml --gitlab-repo owner/repository
```

Set `CI_PROJECT_URL` when links should use a self-hosted GitLab project URL. Use
`GITLAB_TOKEN` for online enrichment when the project requires authentication.

The Azure DevOps preset expects the organization, project, and repository:

```bash
git cliff --config node_modules/gitcliff-config-nick2bad4u/presets/azure-devops-keepachangelog.toml --azure-devops-repo organization/project/repository
```

`AZURE_DEVOPS_REPO` is the environment-variable equivalent. Set
`AZURE_DEVOPS_TOKEN` for online enrichment.

## Shared Parsing Behavior

All presets except `unconventional.toml` parse Conventional Commits while also
retaining unconventional repository subjects. The parser recognizes:

- hybrid headers such as `✨ [feat] (api) add renderer`;
- Gitmoji shortcode headers such as `:sparkles: [feat] (api) add renderer`;
- Conventional Commits such as `fix(parser): handle escaped scope`;
- dependency Gitmoji and Dependabot package or group subjects;
- security and revert Gitmoji before generic type classification;
- known release, merge, PR, and pull bookkeeping as skipped noise;
- unmatched subjects under Other Changes.

Hybrid `(scope)` values are captured into `commit.scope`. Scope-aware templates
remove the hybrid prefix from their displayed subject, so a scope appears once.
Conventional Commit scopes continue to come from git-cliff's normal parser.

Targeted dependency postprocessors remain shared across every preset. A real
package update such as `Bump lodash from 4.17.20 to 4.17.21` is normalized, but
ordinary prose such as `docs: explain Bump version behavior` is not rewritten.

## Programmatic Discovery

The JavaScript entrypoint exposes the published filenames and a path helper:

```ts
import {
 getGitCliffPresetConfigPath,
 gitCliffPresetFileNames,
} from "gitcliff-config-nick2bad4u";

const presetPath = getGitCliffPresetConfigPath("minimal-user-facing.toml");
// "presets/minimal-user-facing.toml"

console.log(gitCliffPresetFileNames);
```

This metadata does not resolve an installation directory. Package scripts should
continue to use the explicit `node_modules/gitcliff-config-nick2bad4u/...` path.

## Maintainer Workflow

The files under `presets/` are generated and must not be edited directly. Their
style templates live in `scripts/generate-gitcliff-presets.mjs`; the generator
derives the shared changelog options and `[git]` parser from `cliff.toml`.

```bash
npm run presets:generate
npm run presets:check
npm run examples:generate
npm run examples:check
npm test -- test/preset-rendering.test.ts
```

`presets:check` fails when a generated file is missing or stale. The rendering
test and examples generator share one deterministic tagged Git repository. They
invoke the installed git-cliff CLI for every preset and cover Unicode and
shortcode Gitmoji, Conventional Commits, every group, scopes, breaking changes,
filtering, provider links, statistics, dependency cleanup, and release-noise
skipping. The test also compares all committed files under `docs/examples/`
byte-for-byte with fresh renders, so stale or missing examples fail CI.
