export function createJsonText(payload, { compact = false } = {}) {
  const spacing = compact ? 0 : 2;
  return `${JSON.stringify(payload, null, spacing)}\n`;
}

export function writeJson(payload, { compact = false, stdout = process.stdout } = {}) {
  stdout.write(createJsonText(payload, { compact }));
}

