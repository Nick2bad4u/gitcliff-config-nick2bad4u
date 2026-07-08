import { describe, expect, it } from "vitest";

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
});
