import type { ValidationResponse } from "../types/validation";

import { API_BASE_URL } from  "../config/api";
 
const API_URL = `${API_BASE_URL}/v1/api/xmlvalidate`;
 

//const API_URL = "http://localhost:8082/v1/api/xmlvalidate";

export async function validateXml(
  xml: string
): Promise<ValidationResponse> {

  const response = await fetch(API_URL, {
    method: "POST",

    headers: {
      "Content-Type": "application/xml",
      "Accept": "application/json",
    },

    body: xml,
  });

  if (!response.ok) {
    throw new Error(
      `Validation API returned ${response.status}`
    );
  }

  return await response.json();
}