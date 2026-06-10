export const APP_CONFIG = {
  maxContextTokens: 8192,
  contextBudgetRatio: 0.7,
  maxMessagesPerRequest: 50,
  maxTotalChars: 32_000,
  rateLimitPerMinute: 10,
  sessionCookieName: "aigc_session",
  sessionMaxAge: 60 * 60 * 24 * 7, // 7 days
} as const;

export const MOCK_USERS = [
  { username: "admin", password: "admin123" },
] as const;
