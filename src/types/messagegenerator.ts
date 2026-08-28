export type ClearingScheme = "SEPA" | "CBPR_PLUS" | "GENERIC";

export interface Pacs008FormData {
  clearingScheme: ClearingScheme;

  debtorName: string;
  debtorIban: string;
  debtorBic: string;

  creditorName: string;
  creditorIban: string;
  creditorBic: string;

  amount: string;
  currency: string;

  remittanceInfo: string;
}

export const emptyPacs008FormData: Pacs008FormData = {
  clearingScheme: "GENERIC",

  debtorName: "",
  debtorIban: "",
  debtorBic: "",

  creditorName: "",
  creditorIban: "",
  creditorBic: "",

  amount: "",
  currency: "EUR",

  remittanceInfo: "",
};