export interface IdentifierValidationResponse {

  valid: boolean;

  type: string;

  value: string;

  message: string;

  details: Record<string, string>;

}