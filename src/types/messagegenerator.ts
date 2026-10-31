export interface MessageGenerationRequest {

  messageType: string;

  debtorName: string;
  debtorIban: string;
  debtorBic: string;

  creditorName: string;
  creditorIban: string;
  creditorBic: string;

  amount: string;
  currency: string;

  endToEndId?: string;
  version?: string;
  fields?: Record<string, string>;
}

export interface GeneratorField {
  key: string;
  label: string;
  section: string;
  required: boolean;
  inputType: "text" | "number" | "currency";
  placeholder: string;
  schemaPath: string;
}


export interface MessageGenerationResponse {

  success: boolean;

  messageType: string;

  geography: string;

  version: string;

  xml: string | null;

  error: string | null;
}
