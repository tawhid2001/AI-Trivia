export function sendGeminiError(res, error) {
  console.error("Gemini request failed:", error);

  const status = Number(error?.status ?? error?.statusCode ?? error?.response?.status);
  const details = [
    error?.message,
    error?.code,
    error?.status,
    error?.error?.message,
    error?.error?.status,
    error?.response?.data?.error?.message,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (
    status === 429 ||
    details.includes("resource_exhausted") ||
    details.includes("resource exhausted") ||
    details.includes("rate limit") ||
    details.includes("quota") ||
    details.includes("too many requests")
  ) {
    return res.status(429).json({
      error: "The AI service has reached its request limit. Please wait a little and try again.",
    });
  }

  if (
    status === 408 ||
    status === 504 ||
    details.includes("deadline_exceeded") ||
    details.includes("timeout") ||
    details.includes("timed out") ||
    details.includes("etimedout")
  ) {
    return res.status(504).json({
      error: "The AI request took too long. Please try again shortly.",
    });
  }

  if (
    status === 502 ||
    status === 503 ||
    status === 529 ||
    details.includes("unavailable") ||
    details.includes("overloaded") ||
    details.includes("high demand") ||
    details.includes("high traffic") ||
    details.includes("busy")
  ) {
    return res.status(503).json({
      error: "The AI service is busy right now. Please try again shortly.",
    });
  }

  return res.status(502).json({
    error: "The AI service couldn't complete this request. Please try again.",
  });
}
