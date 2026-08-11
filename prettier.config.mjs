import prettierConfig from "prettier-config-nick2bad4u";

/**
 * @type {import("prettier").Config}
 */
const localConfig = {
    ...prettierConfig,
    overrides: (prettierConfig.overrides ?? []).map((override) => {
        const filePatterns = Array.isArray(override.files)
            ? override.files
            : [override.files];

        if (
            !filePatterns.includes("*.yaml") ||
            !filePatterns.includes("*.yml")
        ) {
            return override;
        }

        return {
            ...override,
            options: {
                // The YAML plugin rewrites folded GitHub expressions into
                // escaped quoted scalars, so use Prettier's readable built-in
                // YAML formatter for this repository.
                endOfLine: "lf",
                parser: "yaml",
                plugins: [],
                tabWidth: 4,
                useTabs: false,
            },
        };
    }),
};

export default localConfig;
