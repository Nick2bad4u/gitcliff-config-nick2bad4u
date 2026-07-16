/** Absolute path to the generated Markdown example directory. */
export const presetExamplesDirectory: string;

/** Absolute path to the published TOML preset directory. */
export const presetsDirectory: string;

/** Notice at the beginning of every generated example file. */
export const generatedExampleNotice: string;

/** Create the deterministic tagged repository used for preset rendering. */
export function initializePresetExampleRepository(
    repoPath: string
): Promise<void>;

/** Read every published TOML preset filename in stable order. */
export function readPresetFileNames(): Promise<readonly string[]>;

/** Convert a published TOML preset filename to its Markdown example filename. */
export function getPresetExampleFileName(presetFileName: string): string;

/** Wrap a real git-cliff render in the generated documentation notice. */
export function renderPresetExampleDocument(
    presetFileName: string,
    changelog: string
): string;

/** Render the generated index for all documented preset examples. */
export function renderPresetExamplesIndex(
    presetFileNames: readonly string[]
): string;

/** Render all published presets from one deterministic tagged repository. */
export function generateAllPresetOutputs(): Promise<
    ReadonlyMap<string, string>
>;
