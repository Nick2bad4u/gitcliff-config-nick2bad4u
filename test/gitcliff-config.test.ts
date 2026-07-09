import { describe, expect, it } from "vitest";

// eslint-disable-next-line import-x/extensions -- JSON import attributes require the package file extension.
import packageJson from "../package.json" with { type: "json" };
import {
    describeGitCliffConfig,
    gitCliffConfigFileName,
    gitCliffConfigPackageName,
} from "../src/gitcliff-config.js";

describe(describeGitCliffConfig, () => {
    it("returns the shared config package metadata", () => {
        expect.assertions(4);

        expect(gitCliffConfigPackageName).toBe("gitcliff-config-nick2bad4u");
        expect(gitCliffConfigFileName).toBe("cliff.toml");
        expect(describeGitCliffConfig()).toBe(
            "Shared git-cliff changelog configuration for Nick2bad4u repositories"
        );
        expect(describeGitCliffConfig()).not.toHaveLength(0);
    });

    it("keeps the npm package contract wired for shared git-cliff usage", () => {
        expect.assertions(5);

        expect(packageJson.files).toContain("cliff.toml");
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
    });
});
