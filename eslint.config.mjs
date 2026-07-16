import nickTwoBadFourU from "eslint-config-nick2bad4u";

/** @type {import("eslint").Linter.Config[]} */
const config = [
    ...nickTwoBadFourU.configs.all,
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
