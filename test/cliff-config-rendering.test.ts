import { execFile } from "node:child_process";
import { copyFile, mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { remark } from "remark";
import { describe, expect, it } from "vitest";

const repositoryRoot = path.dirname(import.meta.dirname);
const cliffConfigPath = path.join(repositoryRoot, "cliff.toml");
const gitCliffCliPath = fileURLToPath(import.meta.resolve("git-cliff/cli"));

interface RunOptions {
    readonly env?: NodeJS.ProcessEnv;
}

const run = async (
    command: string,
    args: readonly string[],
    cwd: string,
    options: RunOptions = {}
): Promise<string> =>
    new Promise((resolve, reject) => {
        const execOptions =
            options.env === undefined
                ? { cwd, encoding: "utf8" as const }
                : { cwd, encoding: "utf8" as const, env: options.env };
        const childProcess = execFile(
            command,
            [...args],
            execOptions,
            (error, stdout, stderr) => {
                if (error) {
                    reject(
                        new Error(
                            [
                                error.message,
                                stdout,
                                stderr,
                            ]
                                .filter(Boolean)
                                .join("\n"),
                            { cause: error }
                        )
                    );
                    return;
                }

                resolve(stdout);
            }
        );

        childProcess.once("error", reject);
    });

const commitFixture = async (
    repoPath: string,
    fileName: string,
    commitMessage: string,
    fileContents: string,
    commitBody?: string
): Promise<void> => {
    await writeFile(path.join(repoPath, fileName), fileContents);
    await run("git", ["add", fileName], repoPath);
    const commitArguments =
        commitBody === undefined
            ? [
                  "commit",
                  "-m",
                  commitMessage,
              ]
            : [
                  "commit",
                  "-m",
                  commitMessage,
                  "-m",
                  commitBody,
              ];

    await run("git", commitArguments, repoPath);
};

const countOccurrences = (text: string, searchValue: string): number =>
    text.split(searchValue).length - 1;

const hasOnlyPlainDiffTitle = (text: string): boolean =>
    text.includes('"Diff: ') && !text.includes('"📝 Diff: ');

const expectValidGeneratedMarkdown = (changelog: string): void => {
    const parsedMarkdown = remark().parse(changelog);

    expect(parsedMarkdown.type).toBe("root");
    expect(changelog).not.toMatch(/(?:\{%|%\}|\{\{|\}\}|\{#|#\})/v);
    expect(changelog).not.toMatch(/\b(?:NaN|null|undefined)\b/v);
    expect(changelog).not.toMatch(/^###\s*$/mv);
    expect(changelog).not.toMatch(/<!--\s*\d+\s*-->/v);
};

const isOrderedRenderedSubjectAndBody = (
    subjectIndex: number,
    bodyIndex: number
): boolean =>
    subjectIndex !== -1 && bodyIndex !== -1 && subjectIndex < bodyIndex;

const isStrictlyAscending = (values: readonly number[]): boolean =>
    values.every((value, index) => {
        const previous = values[index - 1];

        return index === 0 || (previous !== undefined && previous < value);
    });

const hasOrderedGroups = (text: string, groups: readonly string[]): boolean => {
    const indexes = groups.map((group) => text.indexOf(group));

    return (
        indexes.every((index) => index !== -1) && isStrictlyAscending(indexes)
    );
};

const initializeRepository = async (repoPath: string): Promise<void> => {
    await run("git", ["init"], repoPath);
    await run(
        "git",
        [
            "config",
            "user.name",
            "Config Test",
        ],
        repoPath
    );
    await run(
        "git",
        [
            "config",
            "user.email",
            "config-test@example.com",
        ],
        repoPath
    );
};

const installSharedConfigFixture = async (
    repoPath: string
): Promise<string> => {
    const sharedConfigDirectory = path.join(
        repoPath,
        "node_modules",
        "gitcliff-config-nick2bad4u"
    );

    await mkdir(sharedConfigDirectory, { recursive: true });
    await copyFile(
        cliffConfigPath,
        path.join(sharedConfigDirectory, "cliff.toml")
    );

    return path.join(
        "node_modules",
        "gitcliff-config-nick2bad4u",
        "cliff.toml"
    );
};

describe("cliff.toml", () => {
    it("renders repo-specific links, parser groups, dependency cleanup, and compact commit statistics", async () => {
        expect.assertions(25);

        const repoPath = await mkdtemp(path.join(tmpdir(), "gitcliff-config-"));

        try {
            await initializeRepository(repoPath);
            await commitFixture(
                repoPath,
                "feature.txt",
                "✨ [feat] (core) add renderer",
                "feature\n"
            );
            await commitFixture(
                repoPath,
                "fix.txt",
                "fix(parser): handle escaped scope",
                "fix\n"
            );
            await commitFixture(
                repoPath,
                "docs.txt",
                "📝 [docs] Explain shared config",
                "docs\n",
                "Document shared config usage.\n\nSigned-off-by: Config Test <config-test@example.com>"
            );
            await commitFixture(
                repoPath,
                "dependencies.txt",
                "chore(deps): update npm dependencies",
                "dependencies\n"
            );
            await commitFixture(
                repoPath,
                "lodash.txt",
                "Bump lodash from 4.17.20 to 4.17.21",
                "lodash\n"
            );
            await commitFixture(
                repoPath,
                "bump-docs.txt",
                "docs: explain Bump version behavior",
                "bump docs\n"
            );
            await commitFixture(
                repoPath,
                "import.txt",
                "Initial import",
                "import\n"
            );

            const changelog = await run(
                process.execPath,
                [
                    gitCliffCliPath,
                    "--config",
                    cliffConfigPath,
                    "--github-repo",
                    "Nick2bad4u/example-package",
                    "--unreleased",
                    "--offline",
                ],
                repoPath
            );

            expectValidGeneratedMarkdown(changelog);

            expect(changelog).toMatch(
                /## ✨ What's Changed(?! in)[\s\S]*github\.com\/Nick2bad4u\/example-package\/commit\//v
            );
            expect(changelog).not.toMatch(
                /## \[Unreleased\]|### Commit Statistics|commits included in this release\./v
            );
            expect(hasOnlyPlainDiffTitle(changelog)).toBe(true);
            expect(
                hasOrderedGroups(changelog, [
                    "### ✨ Features",
                    "### 🛠️ Bug Fixes",
                    "### 📝 Documentation",
                    "### 📦 Dependencies",
                    "### 🛠️ Other Changes",
                ])
            ).toBe(true);
            expect(changelog).toContain("[dependency] Update lodash");
            expect(changelog).toContain("Explain Bump version behavior");
            expect(changelog).toContain("*(core)* Add renderer");
            expect(changelog).not.toContain("*(core)* ✨ [feat] (core)");
            expect(changelog).not.toContain("[dependency] test");
            expect(changelog).toMatch(
                /<sub><em>\(\d+ files?, \+\d+, -\d+\)<\/em><\/sub>/v
            );
            expect(changelog).not.toMatch(/<\/?del>/v);
            expect(
                ["**Full Changelog**", "**Release comparison**"].every(
                    (label) => !changelog.includes(label)
                )
            ).toBe(true);

            const documentationSubjectIndex = changelog.indexOf(
                "Explain shared config <sub><em>"
            );
            const documentationBodyIndex = changelog.indexOf(
                "Document shared config usage."
            );

            expect(
                isOrderedRenderedSubjectAndBody(
                    documentationSubjectIndex,
                    documentationBodyIndex
                )
            ).toBe(true);

            expect(changelog).not.toContain("_(stats:");
            expect(changelog).not.toContain("Signed-off-by:");
            expect(countOccurrences(changelog, "<sub><em>(")).toBe(7);
            expect(countOccurrences(changelog, "stats:")).toBe(0);
            expect(changelog).toContain("## ⭐ Contributors");
            expect(changelog).not.toContain("### New Contributors");
            expect(changelog).not.toMatch(/## 📜 License|Project License/v);
        } finally {
            await rm(repoPath, { force: true, recursive: true });
        }
    }, 60_000);

    it("uses the previous release as the GitHub compare base", async () => {
        expect.assertions(2);

        const repoPath = await mkdtemp(path.join(tmpdir(), "gitcliff-config-"));

        try {
            await initializeRepository(repoPath);
            await commitFixture(
                repoPath,
                "release.txt",
                "chore: initial release",
                "release\n"
            );
            await run(
                "git",
                [
                    "tag",
                    "--no-sign",
                    "v1.0.0",
                ],
                repoPath
            );
            await commitFixture(
                repoPath,
                "fix.txt",
                "🐛 [fix] keep compare link complete",
                "fix\n"
            );

            const headSha = (
                await run("git", ["rev-parse", "HEAD"], repoPath)
            ).trim();
            const changelog = await run(
                process.execPath,
                [
                    gitCliffCliPath,
                    "--config",
                    cliffConfigPath,
                    "--github-repo",
                    "Nick2bad4u/example-package",
                    "--unreleased",
                    "--offline",
                ],
                repoPath
            );

            expect(changelog).toContain(
                `/compare/v1.0.0...${headSha} "View full commit range on GitHub"`
            );
            expect(changelog).not.toContain(
                `/compare/${headSha}...${headSha} "View full commit range on GitHub"`
            );
        } finally {
            await rm(repoPath, { force: true, recursive: true });
        }
    }, 60_000);

    it("renders a GitHub-style release comparison note for tagged releases", async () => {
        expect.assertions(13);

        const repoPath = await mkdtemp(path.join(tmpdir(), "gitcliff-config-"));

        try {
            await initializeRepository(repoPath);
            await commitFixture(
                repoPath,
                "release.txt",
                "chore: initial release",
                "release\n"
            );
            await run(
                "git",
                [
                    "tag",
                    "--no-sign",
                    "v1.0.0",
                ],
                repoPath
            );
            await commitFixture(
                repoPath,
                "feature.txt",
                "✨ [feat] add tagged release notes",
                "feature\n"
            );
            await run(
                "git",
                [
                    "tag",
                    "--no-sign",
                    "v1.1.0",
                ],
                repoPath
            );

            const changelog = await run(
                process.execPath,
                [
                    gitCliffCliPath,
                    "--config",
                    cliffConfigPath,
                    "--github-repo",
                    "Nick2bad4u/example-package",
                    "--current",
                    "--offline",
                ],
                repoPath
            );

            expectValidGeneratedMarkdown(changelog);

            expect(changelog).toContain("# 📜 Changelog");
            expect(changelog).not.toContain(
                "All notable changes to this project will be documented in this file."
            );
            expect(changelog).toContain("## ✨ What's Changed in v1.1.0");
            expect(changelog).toContain(
                "> [!NOTE]\n> **Release comparison**: https://github.com/Nick2bad4u/example-package/compare/v1.0.0...v1.1.0"
            );
            expect(changelog).toContain("## ⭐ Contributors");
            expect(changelog).toContain(
                "Thanks to anyone who has 🧑‍💻 [contributed](https://github.com/Nick2bad4u/example-package/graphs/contributors)."
            );
            expect(changelog).toContain(
                "*This changelog was automatically generated with ⛰️ [git-cliff]"
            );
            expect(changelog).not.toContain("Project License");
        } finally {
            await rm(repoPath, { force: true, recursive: true });
        }
    }, 60_000);

    it("renders from a node_modules shared config path with GITHUB_REPO", async () => {
        expect.assertions(10);

        const repoPath = await mkdtemp(path.join(tmpdir(), "gitcliff-config-"));

        try {
            await initializeRepository(repoPath);
            const sharedConfigPath = await installSharedConfigFixture(repoPath);

            await commitFixture(
                repoPath,
                "consumer.txt",
                "✨ [feat] add consumer shared config smoke",
                "consumer\n"
            );

            const githubRepositoryEnvironment = {
                // eslint-disable-next-line n/no-process-env -- Preserve PATH and Git environment while overriding only GITHUB_REPO for this child process.
                ...process.env,
                GITHUB_REPO: "Nick2bad4u/consumer-package",
            };

            const changelog = await run(
                process.execPath,
                [
                    gitCliffCliPath,
                    "--config",
                    sharedConfigPath,
                    "--unreleased",
                    "--offline",
                ],
                repoPath,
                {
                    env: githubRepositoryEnvironment,
                }
            );

            expectValidGeneratedMarkdown(changelog);

            expect(changelog).toContain("## ✨ What's Changed");
            expect(changelog).toContain("add consumer shared config smoke");
            expect(changelog).toContain(
                "https://github.com/Nick2bad4u/consumer-package/commit/"
            );
            expect(changelog).toContain(
                "https://github.com/Nick2bad4u/consumer-package/graphs/contributors"
            );
            expect(changelog).not.toContain(
                "Nick2bad4u/gitcliff-config-nick2bad4u/commit"
            );
        } finally {
            await rm(repoPath, { force: true, recursive: true });
        }
    }, 60_000);
});
