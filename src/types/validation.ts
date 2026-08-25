export interface ValidationError {
  line?: number;
  column?: number;
  code?: string;

  // User-friendly message
  message: string;

  // Suggested fix
  suggestion?: string;

  // Original XSD / technical error
  technicalMessage?: string;
}

export interface ValidationResponse {
  valid: boolean;
  message: string;
  messageType?: string;
  messageTyp?: string;
  version?: string;
  namespace?: string;
  errors?: ValidationError[] | null;
}