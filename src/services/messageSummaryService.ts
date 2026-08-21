export interface MessageSummaryResponse {
  success: boolean;
  messageType: string;
  version: string;
  title: string;
  errorMessage: string | null;
  summary: Record<string, string>;
}

export const generateMessageSummary = async (
  xml: string
): Promise<MessageSummaryResponse> => {

  const response = await fetch(
    "http://localhost:8082/v1/api/message-summary",
    {
      method: "POST",

      headers: {
        "Content-Type": "application/xml",
      "Accept": "application/json",
      },

     body: xml
    }
  );

  if (!response.ok) {
    throw new Error(
      "Unable to generate message summary"
    );
  }

  return response.json();
};