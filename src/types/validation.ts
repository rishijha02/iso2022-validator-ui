export interface ValidationError {
  code: string;
  line: number;
  column: number;
  message: string;
}

export interface ValidationResponse {
  valid: boolean;
  message: string;
  messageTyp: string;
  version: string;
  namespace: string;
  errors: ValidationError[] | null;
}