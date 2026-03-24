import {
  buildPowerShellJsonCommand,
  getWin32ErrorMessage,
  mapWin32Error,
  runPowerShellJson,
} from "./win32.js";

export async function getWin32FrontmostApp(providers = []) {
  try {
    const payload = await runPowerShellJson(
      buildPowerShellJsonCommand(
        `
$windowHandle = Get-TermhubForegroundHandle
if ($windowHandle -eq 0) {
  $payload = [pscustomobject]@{
    processName = $null
  }
} else {
  $processId = Get-TermhubProcessIdFromHandle $windowHandle
  $process = if ($processId -eq 0) { $null } else { Get-Process -Id $processId -ErrorAction SilentlyContinue }
  $payload = [pscustomobject]@{
    processName = ConvertTo-TermhubText $process.ProcessName
  }
}

$payload | ConvertTo-Json -Depth 6 -Compress
        `,
        { uiAutomation: false },
      ),
    );

    const processName = String(payload?.processName ?? "").toLowerCase();
    if (!processName) {
      return null;
    }

    const provider = providers.find((entry) =>
      Array.isArray(entry?.PROVIDER?.processNames)
        ? entry.PROVIDER.processNames.some((name) => name.toLowerCase() === processName)
        : false,
    );

    return {
      app: provider?.PROVIDER?.app ?? null,
      displayName: provider?.PROVIDER?.displayName ?? payload.processName ?? null,
      bundleId: null,
    };
  } catch (error) {
    const mapped = mapWin32Error(getWin32ErrorMessage(error), {
      displayName: "Windows terminal app",
    });
    if (mapped.code === "POWERSHELL_NOT_FOUND" || mapped.code === "POWERSHELL_FAILED") {
      return null;
    }

    return null;
  }
}

