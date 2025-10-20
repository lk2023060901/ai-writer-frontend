/**
 * Simple token estimation service
 * Uses a rough approximation: 1 token ≈ 4 characters for English text
 */
export const estimateTextTokens = async (text: string): Promise<number> => {
  if (!text) return 0;

  // Simple estimation: average of 4 characters per token
  const charCount = text.length;
  const estimatedTokens = Math.ceil(charCount / 4);

  return estimatedTokens;
};

export const TokenService = {
  estimateTextTokens
};

export default TokenService;
