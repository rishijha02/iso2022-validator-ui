import type {
  MessageGenerationRequest,
  MessageGenerationResponse,
  GeneratorField
} from "../types/messagegenerator";

import { API_BASE_URL } from "../config/api";


const API_URL =
  `${API_BASE_URL}/v1/api/messages/generate`;

export async function getGeneratorMessageTypes(family: string): Promise<string[]> {
  const response = await fetch(`${API_URL.replace("/generate", "/types")}?family=${encodeURIComponent(family)}&geography=ISO`);
  if (!response.ok) throw new Error(`Generator message types API returned ${response.status}`);
  return response.json();
}

export async function getGeneratorFields(geography: string, version: string, messageType = "pacs.008"): Promise<GeneratorField[]> {
  const response = await fetch(`${API_URL.replace("/generate", "/schema")}?geography=${encodeURIComponent(geography)}&version=${encodeURIComponent(version)}&messageType=${encodeURIComponent(messageType)}`);
  if (!response.ok) throw new Error(`Generator schema API returned ${response.status}`);
  return response.json();
}

export async function getGeneratorVersions(geography: string, messageType = "pacs.008"): Promise<string[]> {
  const response = await fetch(`${API_URL.replace("/generate", "/versions")}?geography=${encodeURIComponent(geography)}&messageType=${encodeURIComponent(messageType)}`);
  if (!response.ok) throw new Error(`Generator versions API returned ${response.status}`);
  return response.json();
}

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
