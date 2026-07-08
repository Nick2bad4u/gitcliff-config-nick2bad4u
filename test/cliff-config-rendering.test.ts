import { execFile } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const repositoryRoot = path.dirname(import.meta.dirname);
const cliffConfigPath = path.join(repositoryRoot, "cliff.toml");
const gitCliffCliPath = fileURLToPath(import.meta.resolve("git-cliff/cli"));

const run = async (
    command: string,
    args: readonly string[],
    cwd: string
): Promise<string> =>
    new Promise((resolve, reject) => {
        const childProcess = execFile(
            command,
            [...args],
            { cwd, encoding: "utf8" },
            (error, stdout, stderr) => {
                if (error) {
                    reject(new Error(error.message, { cause: error }));
                    return;
                }

                resolve(`${stdout}${stderr}`);
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

const isOrderedRenderedSubjectAndBody = (
    subjectIndex: number,
    bodyIndex: number
): boolean =>
    subjectIndex !== -1 && bodyIndex !== -1 && subjectIndex < bodyIndex;

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

describe("cliff.toml", () => {
    it("renders repo-specific links, parser groups, dependency cleanup, and compact commit statistics", async () => {
        expect.assertions(19);

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
                ],
                repoPath
            );

            expect(changelog).toContain("## [Unreleased]");
            expect(changelog).not.toContain("### Commit Statistics");
            expect(changelog).not.toContain(
                "commits included in this release."
            );
            expect(changelog).toContain(
                "github.com/Nick2bad4u/example-package/commit/"
            );
            expect(hasOnlyPlainDiffTitle(changelog)).toBe(true);
            expect(changelog).toContain("### ✨ Features");
            expect(changelog).toContain("### 🛠️ Bug Fixes");
            expect(changelog).toContain("### 📝 Documentation");
            expect(changelog).toContain("### 📦 Dependencies");
            expect(changelog).toContain("### 🛠️ Other Changes");
            expect(changelog).toContain("[dependency] Update lodash");
            expect(changelog).not.toContain("[dependency] test");
            expect(changelog).toMatch(
                /<sub><em>\(\d+ files?, <ins>\+\d+<\/ins>, <del>-\d+<\/del>\)<\/em><\/sub>/v
            );

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
            expect(countOccurrences(changelog, "<sub><em>(")).toBe(6);
            expect(countOccurrences(changelog, "stats:")).toBe(0);
            expect(changelog).toContain("## ⭐ Contributors");
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
});
