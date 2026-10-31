import { API_BASE_URL } from "../config/api";

export interface FeedbackSubmission {
  name: string;
  country: string;
  email: string;
  feedbackType: "Review" | "Suggestion";
  message: string;
  website: string;
}

export async function submitFeedback(submission: FeedbackSubmission): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/v1/api/feedback`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(submission),
  });

  const result = await response.json().catch(() => ({})) as { message?: string };
  if (!response.ok) {
    throw new Error(result.message || "Unable to send feedback right now.");
  }

  return result.message || "Thank you. Your feedback has been sent.";
}
