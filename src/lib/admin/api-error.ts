type FlattenedIssues = { formErrors?: string[]; fieldErrors?: Record<string, string[] | undefined> };

const STATUS_MESSAGES: Record<number, string> = {
  401: "Your session has expired. Sign in again and retry.",
  403: "Your account does not have permission to do this.",
  404: "This feature is switched off or the item no longer exists.",
  409: "Something with the same details already exists.",
  413: "The file is too large to upload.",
  429: "Too many requests. Wait a minute and try again.",
};

/**
 * Turns a failed admin API response into a message people can act on. Handles JSON bodies with
 * zod `issues`, and non-JSON bodies such as the hosting platform's own 413 or 504 pages, which
 * used to make `response.json()` throw and left forms failing with no message at all.
 */
export async function readApiError(response: Response, fallback: string): Promise<string> {
  let data: { error?: unknown; issues?: FlattenedIssues } | null = null;
  try {
    data = await response.json();
  } catch {
    // Not JSON: fall through to the status-based message.
  }
  const fieldErrors = Object.entries(data?.issues?.fieldErrors ?? {})
    .filter(([, messages]) => messages?.length)
    .map(([field, messages]) => `${field}: ${messages![0]}`);
  const formErrors = data?.issues?.formErrors ?? [];
  const details = [...formErrors, ...fieldErrors];
  const error = typeof data?.error === "string" ? data.error : STATUS_MESSAGES[response.status] ?? fallback;
  return details.length ? `${error} (${details.join("; ")})` : error;
}
