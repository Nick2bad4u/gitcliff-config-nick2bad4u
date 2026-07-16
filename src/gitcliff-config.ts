/**
 * The published npm package name for the shared git-cliff configuration.
 */
export const gitCliffConfigPackageName = "gitcliff-config-nick2bad4u";

/**
 * The package-relative git-cliff TOML configuration filename.
 */
export const gitCliffConfigFileName = "cliff.toml";

/** A package-relative path to a published alternative git-cliff preset. */
export type GitCliffPresetConfigPath = `presets/${GitCliffPresetFileName}`;

/** A published alternative git-cliff preset filename. */
export type GitCliffPresetFileName =
    | "azure-devops-keepachangelog.toml"
    | "change-ledger.toml"
    | "cocogitto.toml"
    | "dependency-audit.toml"
    | "detailed-user-facing.toml"
    | "detailed.toml"
    | "github-keepachangelog.toml"
    | "github.toml"
    | "gitlab-keepachangelog.toml"
    | "keepachangelog.toml"
    | "minimal-user-facing.toml"
    | "minimal.toml"
    | "monorepo.toml"
    | "scoped.toml"
    | "scopesorted.toml"
    | "statistics.toml"
    | "unconventional.toml";

/**
 * Alternative standalone TOML configurations included in the npm package.
 */
export const gitCliffPresetFileNames: readonly GitCliffPresetFileName[] = [
    "azure-devops-keepachangelog.toml",
    "change-ledger.toml",
    "cocogitto.toml",
    "dependency-audit.toml",
    "detailed-user-facing.toml",
    "detailed.toml",
    "github-keepachangelog.toml",
    "github.toml",
    "gitlab-keepachangelog.toml",
    "keepachangelog.toml",
    "minimal-user-facing.toml",
    "minimal.toml",
    "monorepo.toml",
    "scoped.toml",
    "scopesorted.toml",
    "statistics.toml",
    "unconventional.toml",
];

/**
 * Describe the shared git-cliff configuration package.
 *
 * @returns The package label used by smoke tests and generated docs.
 */
export function describeGitCliffConfig(): string {
    return "Shared git-cliff changelog configuration for Nick2bad4u repositories";
}

/**
 * Build the package-relative path for an alternative preset.
 *
 * @param fileName - A filename from {@link gitCliffPresetFileNames}.
 *
 * @returns The path accepted by git-cliff from this package directory.
 */
export function getGitCliffPresetConfigPath(
    fileName: GitCliffPresetFileName
): GitCliffPresetConfigPath {
    return `presets/${fileName}`;
}
