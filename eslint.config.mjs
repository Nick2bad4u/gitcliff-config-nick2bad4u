import nickTwoBadFourU from "eslint-config-nick2bad4u";

/** @type {import("eslint").Linter.Config[]} */
const config = [
    ...nickTwoBadFourU.configs.all,
    {
        files: ["package.json"],
        name: "gitcliff-config/dependency-free-package",
        rules: {
            // The require-dependencies rule mandates the field even though this package
            // has no runtime dependencies. Keep all other empty-field checks.
            "package-json/no-empty-fields": [
                "warn",
                { ignoreProperties: ["files", "dependencies"] },
            ],
        },
    },
    {
        ignores: ["docs/examples/**/*.md"],
        name: "gitcliff-config/generated-preset-examples",
    },
    {
        files: ["presets/**/*.toml"],
        name: "gitcliff-config/generated-presets",
        rules: {
            // Tombi emits TOML 1.1 multiline inline tables here, but git-cliff
            // currently parses TOML 1.0. Prettier and real renders cover these.
            "tombi/tombi": "off",
        },
    },
];

export default config;
