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
}


export interface MessageGenerationResponse {

  success: boolean;

  messageType: string;

  geography: string;

  version: string;

  xml: string | null;

  error: string | null;
}