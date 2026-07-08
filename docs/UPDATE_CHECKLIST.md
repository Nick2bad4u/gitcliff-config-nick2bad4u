# Shared git-cliff Config Update Checklist

Use this checklist when publishing `gitcliff-config-nick2bad4u` or migrating a repository to consume it from `node_modules`.

## Publish This Config Package

- [ ] Confirm `cliff.toml` has the intended changelog groups, postprocessors, compact per-commit statistics, and fallback `[remote.github]` repository.
- [ ] Run `npm run changelog:preview` and verify commit links point at `Nick2bad4u/gitcliff-config-nick2bad4u`.
- [ ] Run `npm run build`.
- [ ] Run `npm run typecheck`.
- [ ] Run `npm run test`.
- [ ] Run `npm run lint:package`.
- [ ] Run `npm pack --dry-run` and confirm the package includes `cliff.toml`, `dist/`, `src/`, `README.md`, and `LICENSE`.
- [ ] Confirm `git-cliff` remains a peer dependency with a minimum version that supports commit and release statistics.

## Migrate A Repository To The Shared Config

- [ ] Install the shared config and git-cliff: `npm install --save-dev gitcliff-config-nick2bad4u git-cliff`.
- [ ] Replace local git-cliff scripts with native git-cliff commands that point at the shared config.

Recommended scripts:

```json
{
 "scripts": {
  "changelog:generate": "git cliff --config node_modules/gitcliff-config-nick2bad4u/cliff.toml --github-repo Nick2bad4u/<repo-name> --output CHANGELOG.md",
  "changelog:preview": "git cliff --config node_modules/gitcliff-config-nick2bad4u/cliff.toml --github-repo Nick2bad4u/<repo-name> --unreleased",
  "changelog:release-notes": "git cliff --config node_modules/gitcliff-config-nick2bad4u/cliff.toml --github-repo Nick2bad4u/<repo-name> --current"
 }
}
```

- [ ] Remove `--strip all` from release-notes generation so the full rendered changelog section is used.
- [ ] Remove the repository-local `cliff.toml` after confirming no repository-specific changelog rules are still needed.
- [ ] Run `npm run changelog:preview` and verify commit links point at the consuming repository, not this config package.
- [ ] If using GitHub Actions, set `GITHUB_REPO: ${{ github.repository }}` and omit `--github-repo` from package scripts.

## Template Refresh

- [ ] Run `NPM-Convert-SharedPackageConfigMigration.ps1 -Path . -SkipDependencyUpdate` after shared config packages are published.
- [ ] Run `npm run update-deps` after confirming the shared package versions are available on npm.
- [ ] Check `.gitleaks.toml` still extends `gitleaks-config-nick2bad4u` and keeps repository-specific allowlists.
- [ ] Check `.npmpackagejsonlintrc.json`, `.remarkrc.mjs`, `.secretlintrc.cjs`, `.yamllint`, `stylelint.config.mjs`, `tsdoc.json`, and `typedoc.json` still point at shared configs.
- [ ] Re-pin reusable workflow callers after updating `Nick2bad4u/workflow-templates`.

## Workflow And CI Review

- [ ] Confirm every workflow has the expected trigger, `run-name`, `concurrency`, permissions, and timeout policy.
- [ ] Confirm reusable workflow callers are pinned to an intentional full SHA.
- [ ] Run `npm run lint:actions`.
- [ ] Run `npm run release:verify`.
- [ ] Review CI behavior on Linux, Windows, and macOS before using the shared config broadly.

## Before Release

- [ ] Confirm `private` is absent from `package.json`.
- [ ] Confirm `publishConfig.provenance` and registry settings are correct.
- [ ] Confirm package exports and declaration files match built output.
- [ ] Create the release tag only after `npm run release:verify` passes locally.
