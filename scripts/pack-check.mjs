import { spawn } from "node:child_process";
import path from "node:path";

const packageDirs = [
  "packages/core",
  "packages/terminal-runtime",
  "packages/provider-darwin",
  "packages/provider-win32",
  "packages/codex-runtime",
  "packages/create-metacli",
];

function runPackCheck(workdir) {
  return new Promise((resolve, reject) => {
    const child = spawn("npm", ["pack", "--dry-run"], {
      cwd: workdir,
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve({
          ok: true,
          workdir,
          output: stdout.trim(),
        });
        return;
      }

      reject(
        new Error(
          `npm pack --dry-run failed for ${workdir}\n${stderr.trim() || stdout.trim()}`,
        ),
      );
    });
  });
}

const results = [];

for (const relativeDir of packageDirs) {
  const workdir = path.resolve(relativeDir);
  results.push(await runPackCheck(workdir));
}

process.stdout.write(`${JSON.stringify({ ok: true, results }, null, 2)}\n`);

