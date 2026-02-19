#!/usr/bin/env node
"use strict";

const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");

const REPO_URL = "https://github.com/Labontese/antigravity-kit-for-codex.git";

function parseArgs(argv) {
  const args = {
    command: argv[0],
    force: false,
    path: process.cwd(),
    branch: "main",
    quiet: false,
    dryRun: false,
  };

  for (let i = 1; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === "--force") {
      args.force = true;
      continue;
    }
    if (arg === "--quiet") {
      args.quiet = true;
      continue;
    }
    if (arg === "--dry-run") {
      args.dryRun = true;
      continue;
    }
    if (arg === "--path") {
      const value = argv[i + 1];
      if (!value) {
        throw new Error("--path requires a value");
      }
      args.path = path.resolve(value);
      i += 1;
      continue;
    }
    if (arg === "--branch") {
      const value = argv[i + 1];
      if (!value) {
        throw new Error("--branch requires a value");
      }
      args.branch = value;
      i += 1;
      continue;
    }
    throw new Error(`Unknown option: ${arg}`);
  }

  return args;
}

function printUsage() {
  process.stdout.write(
    [
      "codex-kit <command> [options]",
      "",
      "Commands:",
      "  init      Install .agent folder and AGENTS.md into your project",
      "  update    Refresh existing .agent folder and AGENTS.md",
      "  status    Check installation status",
      "",
      "Options:",
      "  --force         Overwrite existing .agent folder",
      "  --path <dir>    Install into specific directory",
      "  --branch <name> Use a specific Git branch (network required)",
      "  --quiet         Suppress non-error output",
      "  --dry-run       Show actions without writing files",
      "",
    ].join("\n")
  );
}

function log(message, quiet) {
  if (!quiet) {
    process.stdout.write(`${message}\n`);
  }
}

function ensureDirectory(dirPath, dryRun, quiet) {
  if (dryRun) {
    log(`[dry-run] mkdir -p ${dirPath}`, quiet);
    return;
  }
  fs.mkdirSync(dirPath, { recursive: true });
}

function removeDirectory(dirPath, dryRun, quiet) {
  if (dryRun) {
    log(`[dry-run] rm -rf ${dirPath}`, quiet);
    return;
  }
  fs.rmSync(dirPath, { recursive: true, force: true });
}

function copyDirectory(sourceDir, targetDir, dryRun, quiet) {
  if (dryRun) {
    log(`[dry-run] cp -R ${sourceDir} ${targetDir}`, quiet);
    return;
  }
  fs.cpSync(sourceDir, targetDir, { recursive: true });
}

function copyFile(sourceFile, targetFile, dryRun, quiet) {
  if (dryRun) {
    log(`[dry-run] cp ${sourceFile} ${targetFile}`, quiet);
    return;
  }
  fs.copyFileSync(sourceFile, targetFile);
}

function cloneBranchToTemp(branch, quiet) {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "codex-kit-"));
  const repoDir = path.join(tempRoot, "repo");

  log(`Fetching branch '${branch}' from ${REPO_URL}`, quiet);
  const result = spawnSync(
    "git",
    ["clone", "--depth", "1", "--branch", branch, REPO_URL, repoDir],
    { stdio: "pipe", encoding: "utf8" }
  );

  if (result.status !== 0) {
    const stderr = (result.stderr || "").trim();
    removeDirectory(tempRoot, false, true);
    throw new Error(
      `Failed to clone branch '${branch}'. ${
        stderr || "Please check git/network access."
      }`
    );
  }

  return {
    sourceRoot: repoDir,
    sourceDir: path.join(repoDir, ".agent"),
    sourceContract: path.join(repoDir, "AGENTS.md"),
    cleanup: () => removeDirectory(tempRoot, false, true),
  };
}

function resolveSource(branch, quiet) {
  if (branch && branch !== "main") {
    return cloneBranchToTemp(branch, quiet);
  }

  const localRoot = path.resolve(__dirname, "..");
  const localSource = path.join(localRoot, ".agent");
  if (!fs.existsSync(localSource)) {
    throw new Error(`Template source not found: ${localSource}`);
  }

  return {
    sourceRoot: localRoot,
    sourceDir: localSource,
    sourceContract: path.join(localRoot, "AGENTS.md"),
    cleanup: () => {},
  };
}

function runInit(options) {
  const targetRoot = path.resolve(options.path || process.cwd());
  const targetAgent = path.join(targetRoot, ".agent");
  const targetContract = path.join(targetRoot, "AGENTS.md");

  ensureDirectory(targetRoot, options.dryRun, options.quiet);

  const source = resolveSource(options.branch, options.quiet);
  let installSourceDir = source.sourceDir;
  let snapshotTempDir = null;
  try {
    if (!fs.existsSync(source.sourceDir)) {
      throw new Error(`Source .agent folder missing: ${source.sourceDir}`);
    }

    const hasSourceContract = fs.existsSync(source.sourceContract);

    if (hasSourceContract && fs.existsSync(targetContract) && !options.force) {
      throw new Error(
        `${targetContract} already exists. Re-run with --force to overwrite.`
      );
    }

    if (fs.existsSync(targetAgent)) {
      if (!options.force) {
        throw new Error(
          `${targetAgent} already exists. Re-run with --force to overwrite.`
        );
      }

      // If source and target are the same folder, snapshot source first.
      if (!options.dryRun) {
        const sourceReal = fs.realpathSync(source.sourceDir);
        const targetReal = fs.realpathSync(targetAgent);
        if (sourceReal === targetReal) {
          snapshotTempDir = fs.mkdtempSync(
            path.join(os.tmpdir(), "codex-kit-source-")
          );
          const snapshotAgent = path.join(snapshotTempDir, ".agent");
          fs.cpSync(source.sourceDir, snapshotAgent, { recursive: true });
          installSourceDir = snapshotAgent;
        }
      }

      removeDirectory(targetAgent, options.dryRun, options.quiet);
    }

    copyDirectory(installSourceDir, targetAgent, options.dryRun, options.quiet);

    if (hasSourceContract) {
      // Skip same-file copy when running in this template repo.
      if (
        !options.dryRun &&
        fs.existsSync(targetContract) &&
        fs.realpathSync(source.sourceContract) === fs.realpathSync(targetContract)
      ) {
        log(`AGENTS.md already up to date at ${targetContract}`, options.quiet);
      } else {
        copyFile(
          source.sourceContract,
          targetContract,
          options.dryRun,
          options.quiet
        );
      }
    } else {
      log("Warning: source AGENTS.md not found; only .agent was installed.", options.quiet);
    }

    log(
      options.dryRun
        ? "Dry run complete. No files were changed."
        : `Installed .agent to ${targetAgent} and AGENTS.md to ${targetContract}`,
      options.quiet
    );
  } finally {
    if (snapshotTempDir) {
      removeDirectory(snapshotTempDir, false, true);
    }
    source.cleanup();
  }
}

function runUpdate(options) {
  const targetRoot = path.resolve(options.path || process.cwd());
  const targetAgent = path.join(targetRoot, ".agent");

  if (!fs.existsSync(targetAgent)) {
    throw new Error(
      `${targetAgent} does not exist. Run 'codex-kit init' first.`
    );
  }

  runInit({ ...options, force: true });
}

function runStatus(options) {
  const targetRoot = path.resolve(options.path || process.cwd());
  const targetAgent = path.join(targetRoot, ".agent");
  const targetContract = path.join(targetRoot, "AGENTS.md");
  const hasAgent = fs.existsSync(targetAgent);
  const hasContract = fs.existsSync(targetContract);

  if (hasAgent && hasContract) {
    log(`Status: installed`, options.quiet);
    log(`.agent: ${targetAgent}`, options.quiet);
    log(`AGENTS.md: ${targetContract}`, options.quiet);
    return;
  }

  if (hasAgent || hasContract) {
    log(`Status: partial`, options.quiet);
    log(`.agent present: ${hasAgent}`, options.quiet);
    log(`AGENTS.md present: ${hasContract}`, options.quiet);
    return;
  }

  log(`Status: not installed`, options.quiet);
  log(`Expected .agent path: ${targetAgent}`, options.quiet);
  log(`Expected AGENTS.md path: ${targetContract}`, options.quiet);
}

function main() {
  const argv = process.argv.slice(2);
  if (argv.length === 0 || argv[0] === "--help" || argv[0] === "-h") {
    printUsage();
    process.exit(0);
  }

  let options;
  try {
    options = parseArgs(argv);
  } catch (error) {
    process.stderr.write(`${error.message}\n\n`);
    printUsage();
    process.exit(1);
    return;
  }

  try {
    if (options.command === "init") {
      runInit(options);
      return;
    }
    if (options.command === "update") {
      runUpdate(options);
      return;
    }
    if (options.command === "status") {
      runStatus(options);
      return;
    }
    throw new Error(`Unknown command: ${options.command}`);
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exit(1);
  }
}

main();
