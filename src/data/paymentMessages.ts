export type PaymentMessageField = { path: string; meaning: string };
export type PaymentMessageExample = {
  id: string;
  name: string;
  purpose: string;
  applicability: string;
  xml: string;
  fields: PaymentMessageField[];
};

// Educational snippets only. These are intentionally minimal excerpts, not complete XSD-valid documents.
export const paymentMessageExamples: Record<string, PaymentMessageExample> = {
  "pain.001": {
    id: "pain.001", name: "Customer Credit Transfer Initiation",
    purpose: "Represents a customer or corporate instruction to its bank to initiate one or more credit transfers.",
    applicability: "May be used in customer-to-bank initiation flows where supported by the bank and scheme. Not a generic UPI or Fedwire network message.",
    xml: `<Document>\n  <CstmrCdtTrfInitn>\n    <PmtInf>\n      <CdtTrfTxInf>\n        <Amt>\n          <InstdAmt Ccy="EUR">100.00</InstdAmt>\n        </Amt>\n        <RmtInf>\n          <Ustrd>Invoice 12345</Ustrd>\n        </RmtInf>\n      </CdtTrfTxInf>\n    </PmtInf>\n  </CstmrCdtTrfInitn>\n</Document>`,
    fields: [{ path: "CstmrCdtTrfInitn", meaning: "Customer credit transfer initiation message body." }, { path: "PmtInf", meaning: "Payment information grouping, including instruction-level details." }, { path: "InstdAmt/@Ccy", meaning: "Currency of the instructed amount; EUR is illustrative here." }, { path: "Ustrd", meaning: "Unstructured remittance information, if used." }]
  },
  "pacs.008": {
    id: "pacs.008", name: "FI-to-FI Customer Credit Transfer",
    purpose: "Carries an interbank customer credit-transfer instruction in applicable ISO 20022 payment flows.",
    applicability: "Commonly used in relevant interbank credit-transfer flows, including some SEPA and cross-border arrangements. The applicable version and profile depend on the scheme/route.",
    xml: `<Document>\n  <FIToFICstmrCdtTrf>\n    <CdtTrfTxInf>\n      <IntrBkSttlmAmt Ccy="EUR">100.00</IntrBkSttlmAmt>\n      <RmtInf>\n        <Ustrd>Invoice 12345</Ustrd>\n      </RmtInf>\n    </CdtTrfTxInf>\n  </FIToFICstmrCdtTrf>\n</Document>`,
    fields: [{ path: "FIToFICstmrCdtTrf", meaning: "FI-to-FI customer credit-transfer message body." }, { path: "CdtTrfTxInf", meaning: "Transaction-level information for the credit transfer." }, { path: "IntrBkSttlmAmt", meaning: "Interbank settlement amount; EUR is illustrative here." }, { path: "RmtInf/Ustrd", meaning: "Optional unstructured remittance information." }]
  },
  "pacs.002": {
    id: "pacs.002", name: "FI-to-FI Payment Status Report",
    purpose: "Reports status information about a payment instruction or transaction in supported interbank flows.",
    applicability: "Used where the scheme and implementation support this status-reporting pattern. Status semantics and timing are scheme-specific.",
    xml: `<Document>\n  <FIToFIPmtStsRpt>\n    <TxInfAndSts>\n      <OrgnlEndToEndId>PAY-2026-0001</OrgnlEndToEndId>\n      <TxSts>ACSP</TxSts>\n    </TxInfAndSts>\n  </FIToFIPmtStsRpt>\n</Document>`,
    fields: [{ path: "FIToFIPmtStsRpt", meaning: "Payment status report message body." }, { path: "OrgnlEndToEndId", meaning: "Reference to the original transaction's end-to-end identifier." }, { path: "TxSts", meaning: "Transaction status code; ACSP is illustrative and must be interpreted using the applicable scheme rules." }]
  },
  "pacs.004": {
    id: "pacs.004", name: "Payment Return",
    purpose: "Carries a return of funds related to a previously processed payment in applicable ISO 20022 flows.",
    applicability: "Used when the applicable scheme/route uses the ISO 20022 payment-return message. Not every rejection or failed payment is represented as a pacs.004 return.",
    xml: `<Document>\n  <PmtRtr>\n    <TxInf>\n      <OrgnlEndToEndId>PAY-2026-0001</OrgnlEndToEndId>\n      <RtrdIntrBkSttlmAmt Ccy="EUR">100.00</RtrdIntrBkSttlmAmt>\n    </TxInf>\n  </PmtRtr>\n</Document>`,
    fields: [{ path: "PmtRtr", meaning: "Payment return message body." }, { path: "OrgnlEndToEndId", meaning: "Reference linking the return to the original transaction." }, { path: "RtrdIntrBkSttlmAmt", meaning: "Amount being returned between institutions; currency and amount are illustrative." }]
  }
};
