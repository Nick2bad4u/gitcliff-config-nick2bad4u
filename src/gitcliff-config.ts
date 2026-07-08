/**
 * The published npm package name for the shared git-cliff configuration.
 */
export const gitCliffConfigPackageName = "gitcliff-config-nick2bad4u";

/**
 * The package-relative git-cliff TOML configuration filename.
 */
export const gitCliffConfigFileName = "cliff.toml";

/**
 * Describe the shared git-cliff configuration package.
 *
 * @returns The package label used by smoke tests and generated docs.
 */
export function describeGitCliffConfig(): string {
    return "Shared git-cliff changelog configuration for Nick2bad4u repositories";
}
