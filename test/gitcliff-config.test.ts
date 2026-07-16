import { describe, expect, it } from "vitest";

// eslint-disable-next-line import-x/extensions -- JSON import attributes require the package file extension.
import packageJson from "../package.json" with { type: "json" };
import {
    describeGitCliffConfig,
    getGitCliffPresetConfigPath,
    gitCliffConfigFileName,
    gitCliffConfigPackageName,
    gitCliffPresetFileNames,
} from "../src/gitcliff-config.js";

describe(describeGitCliffConfig, () => {
    it("returns the shared config package metadata", () => {
        expect.assertions(7);

        expect(gitCliffConfigPackageName).toBe("gitcliff-config-nick2bad4u");
        expect(gitCliffConfigFileName).toBe("cliff.toml");
        expect(describeGitCliffConfig()).toBe(
            "Shared git-cliff changelog configuration for Nick2bad4u repositories"
        );
        expect(describeGitCliffConfig()).not.toHaveLength(0);
        expect(gitCliffPresetFileNames).toHaveLength(17);
        expect(gitCliffPresetFileNames).toContain("minimal-user-facing.toml");
        expect(getGitCliffPresetConfigPath("scoped.toml")).toBe(
            "presets/scoped.toml"
        );
    });

    it("keeps the npm package contract wired for shared git-cliff usage", () => {
        expect.assertions(9);

        expect(packageJson.files).toContain("cliff.toml");
        expect(packageJson.files).toContain("docs");
        expect(packageJson.files).toContain("presets");
        expect(packageJson.peerDependencies["git-cliff"]).toBe("^2.10.0");
        expect(packageJson.scripts["changelog:preview"]).toContain(
            "--github-repo Nick2bad4u/gitcliff-config-nick2bad4u"
        );
        expect(packageJson.scripts["changelog:release-notes"]).toContain(
            "--current"
        );
        expect(packageJson.scripts["changelog:release-notes"]).not.toContain(
            "--strip"
        );
        expect(packageJson.scripts["presets:generate"]).toContain(
            "generate-gitcliff-presets.mjs"
        );
        expect(packageJson.scripts["lint:config"]).toContain("presets:check");
    });
});
