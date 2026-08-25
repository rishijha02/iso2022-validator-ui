import { API_BASE_URL } from "../config/api";
import type { ValidationResponse } from "../types/validation";

// TODO: confirm this path once the backend endpoint is built.
const CUSTOM_XSD_VALIDATE_URL = `${API_BASE_URL}/v1/api/xmlvalidate/custom`;

/**
 * Validates an XML message against a user-supplied XSD file.
 *
 * Sent as multipart/form-data with two parts:
 *   - "xml": the message being validated (as a Blob)
 *   - "xsd": the uploaded schema file
 *
 * Response shape is assumed to match ValidationResponse for now —
 * update this once the real endpoint's contract is finalized.
 */
export async function validateWithCustomXsd(
  xml: string,
  xsdFile: File
): Promise<ValidationResponse> {

  const formData = new FormData();

  const cleanedXml = xml.trim();

  formData.append(
    "xml",
    cleanedXml
  );

  formData.append("xsd", xsdFile);

  const response = await fetch(CUSTOM_XSD_VALIDATE_URL, {
    method: "POST",

    // no Content-Type header set on purpose — the browser sets the
    // correct multipart boundary automatically for FormData bodies

    body: formData,
  });

  if (!response.ok) {
    throw new Error(
      `Custom XSD validation API returned ${response.status}`
    );
  }

  return await response.json();
}