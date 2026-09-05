import type {
  MessageGenerationRequest,
  MessageGenerationResponse
} from "../types/messagegenerator";

import { API_BASE_URL } from "../config/api";


const API_URL =
  `${API_BASE_URL}/v1/api/messages/generate`;

export async function generateMessage(
  request: MessageGenerationRequest,
  geography: string
): Promise<MessageGenerationResponse> {

  const response = await fetch(
    `${API_URL}?geography=${encodeURIComponent(geography)}`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },

      body: JSON.stringify(request)
    }
  );


  if (!response.ok) {

    throw new Error(
      `Message generation API returned ${response.status}`
    );
  }


  return await response.json();
}