export function getAnthropicApiKey(): string | undefined {
  const key = process.env.ANTHROPIC_API_KEY?.trim();
  return key || undefined;
}

export function isClaudeConfigured(): boolean {
  return getAnthropicApiKey() !== undefined;
}

const DEFAULT_CLAUDE_MODEL = "claude-sonnet-4-5";

export function getClaudeModel(): string {
  return process.env.ANTHROPIC_MODEL?.trim() || DEFAULT_CLAUDE_MODEL;
}
