export function createCliSpec({
  source = "metacli",
  specVersion = 1,
  cli,
  purpose = null,
  platform = process.platform,
  supportedPlatforms = [],
  supportedApps = [],
  commands = {},
  conventions = {},
  recommendedWorkflow = [],
} = {}) {
  return {
    ok: true,
    source,
    specVersion,
    cli,
    purpose,
    platform,
    supportedPlatforms,
    supportedApps,
    recommendedWorkflow,
    conventions,
    commands,
  };
}

export function createDoctorCheck({
  id,
  ok,
  summary,
  severity = "error",
  details = null,
} = {}) {
  return {
    id,
    ok: ok === true,
    summary,
    severity,
    details,
  };
}

export function createDoctorReport({
  source = "metacli",
  cli = null,
  platform = process.platform,
  checks = [],
  details = null,
} = {}) {
  return {
    ok: checks.every((check) => check.ok === true),
    source,
    cli,
    platform,
    generatedAt: new Date().toISOString(),
    checks,
    details,
  };
}

