import { spawn } from "node:child_process";

function runAppleScript(script) {
  return new Promise((resolve, reject) => {
    const child = spawn("osascript", ["-e", script], {
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
        resolve(stdout.trim());
        return;
      }

      reject(new Error(stderr.trim() || stdout.trim() || "AppleScript execution failed"));
    });
  });
}

export async function getDarwinFrontmostApp(providers = []) {
  try {
    const [bundleId, name] = await Promise.all([
      runAppleScript(
        'tell application "System Events" to get bundle identifier of first application process whose frontmost is true',
      ),
      runAppleScript(
        'tell application "System Events" to get name of first application process whose frontmost is true',
      ),
    ]);

    const provider = providers.find((entry) => entry?.PROVIDER?.bundleId === bundleId);
    return {
      app: provider?.PROVIDER?.app ?? null,
      displayName: provider?.PROVIDER?.displayName ?? name ?? null,
      bundleId,
    };
  } catch {
    return null;
  }
}

