import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

import {
    generatedExampleNotice,
    getPresetExampleFileName,
    presetExamplesDirectory,
    generateAllPresetOutputs,
    renderPresetExampleDocument,
    renderPresetExamplesIndex,
} from "./preset-example-fixture.mjs";

const checkOnly = process.argv.includes("--check");

/**
 * @param {unknown} error Caught filesystem error.
 *
 * @returns {error is NodeJS.ErrnoException} Whether the value has an error
 *   code.
 */
const isNodeError = (error) => error instanceof Error && "code" in error;

/**
 * @returns {Promise<readonly string[]>} Existing Markdown filenames, or an
 *   empty list when the examples directory does not exist.
 */
const readExistingExampleFileNames = async () => {
    try {
        return (await readdir(presetExamplesDirectory))
            .filter((fileName) => fileName.endsWith(".md"))
            .sort((left, right) => left.localeCompare(right, "en"));
    } catch (error) {
        if (isNodeError(error) && error.code === "ENOENT") {
            return [];
        }

        throw error;
    }
};

/**
 * @param {ReadonlyMap<string, string>} outputs Rendered output by preset.
 *
 * @returns {ReadonlyMap<string, string>} Expected documentation files.
 */
const createExpectedFiles = (outputs) => {
    const presetFileNames = [...outputs.keys()];
    const files = new Map([
        ["README.md", renderPresetExamplesIndex(presetFileNames)],
    ]);

    for (const [presetFileName, changelog] of outputs) {
        files.set(
            getPresetExampleFileName(presetFileName),
            renderPresetExampleDocument(presetFileName, changelog)
        );
    }

    return files;
};

/**
 * @param {ReadonlyMap<string, string>} expectedFiles Expected generated files.
 *
 * @returns {Promise<void>}
 */
const checkExamples = async (expectedFiles) => {
    const existingFileNames = await readExistingExampleFileNames();
    const expectedFileNames = [...expectedFiles.keys()].sort((left, right) =>
        left.localeCompare(right, "en")
    );
    const diagnostics = [];

    for (const fileName of expectedFileNames) {
        if (!existingFileNames.includes(fileName)) {
            diagnostics.push(`missing: docs/examples/${fileName}`);
            continue;
        }

        const actual = await readFile(
            path.join(presetExamplesDirectory, fileName),
            "utf8"
        );

        if (actual.replaceAll("\r\n", "\n") !== expectedFiles.get(fileName)) {
            diagnostics.push(`stale: docs/examples/${fileName}`);
        }
    }

    for (const fileName of existingFileNames) {
        if (!expectedFiles.has(fileName)) {
            diagnostics.push(`unexpected: docs/examples/${fileName}`);
        }
    }

    if (diagnostics.length > 0) {
        throw new Error(
            [
                "Preset examples are not current.",
                ...diagnostics.map((diagnostic) => `- ${diagnostic}`),
                "Run npm run examples:generate.",
            ].join("\n")
        );
    }

    console.log(`${expectedFiles.size - 1} preset examples are current.`);
};

/**
 * @param {ReadonlyMap<string, string>} expectedFiles Expected generated files.
 *
 * @returns {Promise<void>}
 */
const writeExamples = async (expectedFiles) => {
    await mkdir(presetExamplesDirectory, { recursive: true });
    const existingFileNames = await readExistingExampleFileNames();

    for (const fileName of existingFileNames) {
        if (expectedFiles.has(fileName)) {
            continue;
        }

        const stalePath = path.join(presetExamplesDirectory, fileName);
        const staleContent = await readFile(stalePath, "utf8");

        if (!staleContent.startsWith(generatedExampleNotice)) {
            throw new Error(
                `Refusing to remove non-generated file: docs/examples/${fileName}`
            );
        }

        await rm(stalePath);
    }

    await Promise.all(
        [...expectedFiles].map(async ([fileName, content]) =>
            writeFile(
                path.join(presetExamplesDirectory, fileName),
                content,
                "utf8"
            )
        )
    );

    console.log(`Generated ${expectedFiles.size - 1} preset examples.`);
};

const main = async () => {
    const outputs = await generateAllPresetOutputs();
    const expectedFiles = createExpectedFiles(outputs);

    if (checkOnly) {
        await checkExamples(expectedFiles);
    } else {
        await writeExamples(expectedFiles);
    }
};

const isMain =
    process.argv[1] !== undefined &&
    path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
    try {
        await main();
    } catch (error) {
        console.error(error instanceof Error ? error.message : error);
        process.exitCode = 1;
    }
}
