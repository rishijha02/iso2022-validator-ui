import { API_BASE_URL } from "../config/api";
import type { Pacs008FormData } from "../types/messagegenerator";

const API_URL = `${API_BASE_URL}/v1/api/message-generator/pacs008`;

export async function generatePacs008Message(
  formData: Pacs008FormData
): Promise<string> {

  const response = await fetch(API_URL, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
      "Accept": "application/xml",
    },

    body: JSON.stringify(formData),
  });

  if (!response.ok) {
    throw new Error(
      `Message generator API returned ${response.status}`
    );
  }

  return await response.text();
}