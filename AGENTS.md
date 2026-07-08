# Repository Instructions

This repository publishes the shared `gitcliff-config-nick2bad4u` package.
Treat `cliff.toml` as the public configuration surface for consuming repositories.

## Priorities

- Preserve shared changelog behavior unless a target repository has a clear reason to opt out.
- Prefer repository scripts over ad hoc commands in GitHub Actions.
- Keep generated output, dependency folders, build artifacts, and local reports out of commits.
- Do not weaken security scanners or release gates to make CI pass.
- Keep workflow permissions least-privilege and keep third-party actions pinned by SHA where already pinned.
- Keep release-note generation full length; do not reintroduce `--strip all`.

## Common Commands

```bash
npm run changelog:preview
npm run lint:all
npm run typecheck
npm run test
npm run release:verify
```

## Tooling Baseline

- Node is controlled by `.node-version`, `.nvmrc`, and `package.json#engines`.
- npm is controlled by `packageManager`.
- ESLint extends `eslint-config-nick2bad4u`.
- Prettier extends `prettier-config-nick2bad4u`.
- Package JSON, Secretlint, Remark, Yamllint, TSDoc, Gitleaks, TypeScript, Vitest, and TypeDoc configs are included.
- GitHub Actions use local scripts for validation and caller workflows for shared security/dependency automation.
- git-cliff consumers should call `git cliff --config node_modules/gitcliff-config-nick2bad4u/cliff.toml` and pass `--github-repo` or set `GITHUB_REPO`.
