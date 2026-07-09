# Git-Cliff Tera Templating Guide

<!-- {% raw %} -->

This guide is scoped to how this package uses Tera inside `git-cliff`.
It is not a general Tera, Rust, Zola, or web templating reference.

The shared config lives in [`cliff.toml`](../cliff.toml). git-cliff renders the
Tera templates from the `[changelog]` table:

- `header`: rendered once at the top of a generated changelog.
- `body`: rendered for each release section.
- `footer`: rendered once at the bottom of a generated changelog.

## Validate Changes

Render the changelog after every template edit. This validates both TOML parsing
and Tera rendering.

```bash
npm run changelog:preview:offline
```

Use the online preview when you need GitHub PR or contributor metadata:

```bash
npm run changelog:preview
```

Offline rendering is deterministic and does not call GitHub, but values under
`github`, such as first-time contributors, are omitted.

## Repository Links

The config is shared through `node_modules`, so links must resolve to the
consuming repository instead of this package whenever possible.

Consumers should pass the repository at runtime:

```bash
git cliff --config node_modules/gitcliff-config-nick2bad4u/cliff.toml --github-repo Nick2bad4u/my-package
```

GitHub Actions can set it once:

```yaml
env:
 GITHUB_REPO: "${{ github.repository }}"
```

Inside templates, build links from `remote.github.owner` and
`remote.github.repo`. This config uses a local macro to avoid repeating the
base URL:

```tera
{%- macro remote_url() -%}
  https://github.com/{{ remote.github.owner }}/{{ remote.github.repo }}
{%- endmacro -%}
```

Call it with `{{ self::remote_url() }}`:

```tera
[commit]({{ self::remote_url() }}/commit/{{ commit.id }})
```

## Git-Cliff Context Values

These are the context values used by this package. Treat them as the practical
surface area for template work here.

| Value                                        | Used For                                                   |
| -------------------------------------------- | ---------------------------------------------------------- |
| `version`                                    | Current release version. Missing for unreleased previews.  |
| `timestamp`                                  | Release rendering time, usually formatted with `date`.     |
| `previous.version`                           | Previous release tag/version for compare links.            |
| `commit_range.from` / `commit_range.to`      | Raw commit range for unreleased compare links.             |
| `bump_type`                                  | Optional `major`, `minor`, or `patch` release messaging.   |
| `commits`                                    | Release commits after git-cliff parsing and preprocessing. |
| `submodule_commits`                          | Commits found in submodules when enabled.                  |
| `remote.github.owner` / `remote.github.repo` | Repo-specific link generation.                             |
| `github.contributors`                        | GitHub contributor metadata when not offline.              |

Common commit fields used in the body:

| Value                             | Used For                               |
| --------------------------------- | -------------------------------------- |
| `commit.id`                       | Commit SHA links and short SHA labels. |
| `commit.message`                  | Rendered commit subject/body text.     |
| `commit.scope`                    | Conventional commit scope.             |
| `commit.breaking`                 | Breaking-change marker.                |
| `commit.statistics.files_changed` | Per-commit changed file count.         |
| `commit.statistics.additions`     | Per-commit added line count.           |
| `commit.statistics.deletions`     | Per-commit deleted line count.         |

## Syntax Used In This Config

### Conditionals

Use `if`, `elif`, and `else` to handle released vs unreleased output:

```tera
{% if version %}
  ## What's Changed in {{ version }}
{% else %}
  ## What's Changed
{% endif %}
```

Guard optional nested values before using them:

```tera
{% if previous and previous.version %}
  **Full Changelog**: {{ self::remote_url() }}/compare/{{ previous.version }}...{{ version }}
{% endif %}
```

### Loops

Loop over grouped commits with `group_by`:

```tera
{% for group, commits in commits | group_by(attribute="group") %}
  ### {{ group | striptags | trim | upper_first }}
  {% for commit in commits %}
    - {{ commit.message | upper_first }}
  {% endfor %}
{% endfor %}
```

The parser stores hidden sort markers in group names, such as
`<!-- 0 -->✨ Features`. Always clean group headings before rendering:

```tera
{{ group | striptags | trim | upper_first }}
```

### Assignments

Use `set` for local values:

```tera
{% set commit_message_lines = commit.message | split(pat="\n") %}
```

Use `set_global` only when a value must be updated inside a loop and read after
that loop. This config uses it to count valid first-time contributors:

```tera
{% set new_contributor_count = 0 %}
{% for contributor in github.contributors | filter(attribute="is_first_time", value=true) %}
  {% if contributor.username %}
    {% set_global new_contributor_count = new_contributor_count + 1 %}
  {% endif %}
{% endfor %}
```

### Filters

Useful filters in this config:

- `truncate`: `{{ commit.id | truncate(length=7, end="") }}`
- `date`: `{{ timestamp | date(format="%Y-%m-%d") }}`
- `split`: `{{ commit.message | split(pat="\n") }}`
- `first`: `{{ commit_message_lines | first }}`
- `replace`: `{{ message | replace(from=" - ", to="\n    - ") }}`
- `group_by`: `{{ commits | group_by(attribute="group") }}`
- `filter`: `{{ github.contributors | filter(attribute="is_first_time", value=true) }}`
- `striptags`: `{{ group | striptags }}`
- `trim`: `{{ group | trim }}`
- `upper_first`: `{{ commit.message | upper_first }}`
- `indent`: `{{ commit.footer | trim | indent(width=8) }}`

Keep filters focused on formatting. Put commit classification in
`[git].commit_parsers` rather than trying to classify commits in Tera.

### Whitespace Control

git-cliff templates are Markdown, so extra blank lines are visible. Use Tera
whitespace control deliberately:

- `{%-` trims whitespace before a statement.
- `-%}` trims whitespace after a statement.
- `\` at the end of a TOML template line keeps git-cliff output compact.
- `{% raw %}\n{% endraw %}` can force a literal newline when aggressive
  trimming would otherwise remove it.

Example:

```tera
{% if version %}\
  ## What's Changed in {{ version }}
{% else %}\
  ## What's Changed
{% endif %}
```

Do not add broad whitespace trimming around every block. Render a preview and
adjust only the places that create noisy blank lines or collapsed Markdown.

## GitHub Metadata

The `[remote]` config keeps GitHub metadata enabled by default:

```toml
[remote]
    offline = false
```

That allows git-cliff to populate `github.contributors` during normal release
generation. Use `--offline` for local validation when GitHub metadata is not
needed.

Always guard GitHub-only values:

```tera
{%- if github -%}
  {# GitHub metadata is available only when not offline. #}
{%- endif -%}
```

Also guard optional contributor fields. GitHub metadata can include entries
without a usable username:

```tera
{% if contributor.username %}
  * @{{ contributor.username }} made their first contribution
{% endif %}
```

## Release Notes Rules

Do not reintroduce `--strip all`. The release workflow expects the full rendered
section from `changelog:release-notes`.

Keep these release-note details in the template:

- GitHub-style `## What's Changed` headings.
- Grouped commit sections.
- Per-commit links and compact diff statistics.
- Optional first-time contributor section.
- Full changelog compare link for tagged releases.
- Footer attribution to git-cliff.

## Common Failure Modes

- Missing `--github-repo` or `GITHUB_REPO`: links point at this config package
  instead of the consuming repository.
- Online-only metadata used without a guard: offline previews fail or render
  empty contributor text.
- Group headings rendered without `striptags`: hidden sort comments appear in
  the changelog.
- `<del>` around deletion counts: GitHub renders deletions as strikethrough,
  making the stats hard to read.
- Over-aggressive whitespace trimming: Markdown headings, lists, and compare
  links collapse together.
- Template edits made without rendering: TOML and Tera errors are only caught
  when git-cliff runs.

## Minimal Safe Workflow

1. Edit `cliff.toml`.
2. Run `npm run changelog:preview:offline`.
3. Run `npm run changelog:preview` if the change touches GitHub metadata.
4. Run `npm test -- --run test/cliff-config-rendering.test.ts`.
5. Run `npm run lint:remark` if documentation changed.

<!-- {% endraw %} -->
