import { useMemo, useState } from "react";
import { API_BASE_URL } from "../config/api";
import { Link } from "react-router-dom";
import SEO from "../components/SEO";

type FlowType = "ais" | "pis";
type StepId = "consent" | "authorize" | "code" | "token" | "accounts" | "payment" | "payment-consent" | "payment-auth" | "payment-submit" | "payment-status";

const aisSteps: { id: StepId; number: string; title: string; subtitle: string }[] = [
  { id: "consent", number: "01", title: "Create consent", subtitle: "TPP requests access" },
  { id: "authorize", number: "02", title: "User authorization", subtitle: "Customer approves access" },
  { id: "token", number: "03", title: "Access token", subtitle: "Issue a demo token" },
  { id: "accounts", number: "04", title: "Account data", subtitle: "AIS data returned" },
];

const pisSteps: { id: StepId; number: string; title: string; subtitle: string }[] = [
  { id: "payment", number: "01", title: "Create payment", subtitle: "TPP prepares payment" },
  { id: "payment-consent", number: "02", title: "Payment consent", subtitle: "Customer reviews payment" },
  { id: "payment-auth", number: "03", title: "User authorization", subtitle: "Customer approves payment" },
  { id: "payment-submit", number: "04", title: "Payment submitted", subtitle: "Bank accepts instruction" },
  { id: "payment-status", number: "05", title: "Payment status", subtitle: "Payment state returned" },
];

const accountData = {
  accounts: [
    {
      accountId: "ACC-001",
      accountType: "CURRENT",
      currency: "EUR",
      balance: 5240.5,
      availableBalance: 4980.5,
    },
  ],
};

function OpenBankingLabPage() {
  const [flowType, setFlowType] = useState<FlowType>("ais");
  const [activeStep, setActiveStep] = useState(0);
  const [permissions, setPermissions] = useState({
    accounts: true,
    balances: true,
    transactions: false,
  });
  const [payment, setPayment] = useState({
    amount: "500.00",
    currency: "EUR",
    debtor: "Demo Current Account",
    creditor: "Demo Merchant Account",
    reference: "INV-2026-001",
  });
  const [simulationStarted, setSimulationStarted] = useState(false);
  const [consentId, setConsentId] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [apiRequest, setApiRequest] = useState("");
  const [apiResponse, setApiResponse] = useState("");
  const [httpStatus, setHttpStatus] = useState<number | null>(null);
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);
  const [aisAccounts, setAisAccounts] = useState<unknown>(null);

  const steps = flowType === "ais" ? aisSteps : pisSteps;
  const currentStep = steps[activeStep];

  const selectedPermissions = () => [
    permissions.accounts && "ACCOUNTS",
    permissions.balances && "BALANCES",
    permissions.transactions && "TRANSACTIONS",
  ].filter(Boolean) as string[];

  const aisRequestBody = (approved = false) => ({
    ibannum: "DEMO-IBAN-001",
    durationindays: 90,
    approved,
    permission: selectedPermissions().map((permissionValue) => ({ permissionValue })),
  });

  const requestPayload = useMemo(() => {
    if (flowType === "pis") {
      if (currentStep.id === "payment") {
        return JSON.stringify({
          amount: payment.amount, currency: payment.currency,
          debtorAccount: "ACC-001", creditor: payment.creditor,
          reference: payment.reference,
        }, null, 2);
      }
      if (currentStep.id === "payment-consent") return "POST /payments\n\nconsentId=PAY-CONSENT-2026-001";
      if (currentStep.id === "payment-auth") return "POST /oauth/authorize\n\nresponse_type=code\nclient_id=fintechschema-demo";
      if (currentStep.id === "payment-submit") return "POST /payments/PAY-2026-001\n\nAuthorization: Bearer demo-access-token";
      return "GET /payments/PAY-2026-001\n\nAuthorization: Bearer demo-access-token";
    }

    if (currentStep.id === "consent") {
      return JSON.stringify({
        permissions: [
          permissions.accounts && "Accounts",
          permissions.balances && "Balances",
          permissions.transactions && "Transactions",
        ].filter(Boolean),
        access: "ongoing", purpose: "Open Banking Lab demonstration",
      }, null, 2);
    }
    if (currentStep.id === "authorize") return JSON.stringify({ consentId: "CONSENT-2026-001", action: "AUTHORIZE", customer: "demo-user" }, null, 2);
    if (currentStep.id === "code") return "POST /oauth/authorize\n\nresponse_type=code\nclient_id=fintechschema-demo";
    if (currentStep.id === "token") return `POST /api/open-banking/ais/token?consentId=${consentId || "<consentId>"}\n\n${JSON.stringify(aisRequestBody(true), null, 2)}`;
    return `GET /api/open-banking/ais/accounts?consentId=${consentId || "<consentId>"}`;
  }, [currentStep.id, permissions, flowType, payment]);

  const responsePayload = useMemo(() => {
    if (flowType === "pis") {
      if (currentStep.id === "payment") return JSON.stringify({ paymentId: "PAY-2026-001", status: "AwaitingAuthorisation" }, null, 2);
      if (currentStep.id === "payment-consent") return JSON.stringify({ paymentConsentId: "PAY-CONSENT-2026-001", status: "AwaitingAuthorisation" }, null, 2);
      if (currentStep.id === "payment-auth") return JSON.stringify({ authorizationCode: "PAY-AUTH-CODE-789", expiresIn: 60 }, null, 2);
      if (currentStep.id === "payment-submit") return JSON.stringify({ paymentId: "PAY-2026-001", status: "AcceptedSettlementInProcess" }, null, 2);
      return JSON.stringify({ paymentId: "PAY-2026-001", status: "AcceptedSettlementCompleted", amount: payment.amount, currency: payment.currency }, null, 2);
    }
    if (currentStep.id === "consent") return JSON.stringify({ consentId: "CONSENT-2026-001", status: "AwaitingAuthorisation" }, null, 2);
    if (currentStep.id === "authorize") return JSON.stringify({ consentId: "CONSENT-2026-001", status: "Authorised" }, null, 2);
    if (currentStep.id === "code") return JSON.stringify({ authorizationCode: "AUTH-CODE-789", expiresIn: 60 }, null, 2);
    if (currentStep.id === "token") return JSON.stringify({ accessToken: "demo-access-token", tokenType: "Bearer", expiresIn: 3600 }, null, 2);
    return JSON.stringify(accountData, null, 2);
  }, [currentStep.id, flowType, payment]);

  const displayedRequest = apiRequest || requestPayload;
  const displayedResponse = apiResponse || responsePayload;

  const callAisApi = async (method: string, path: string, body?: unknown, token?: string) => {
    const url = `${API_BASE_URL}${path}`;
    const headers: Record<string, string> = { Accept: "application/json" };
    if (body !== undefined) headers["Content-Type"] = "application/json";
    if (token) headers.Authorization = `Bearer ${token}`;
    const requestText = `${method} ${path}${token ? `\nAuthorization: Bearer ${token}` : ""}${body !== undefined ? `\n\n${JSON.stringify(body, null, 2)}` : ""}`;
    setApiRequest(requestText);
    setApiResponse("Waiting for backend response…");
    setHttpStatus(null);
    setApiError("");
    setLoading(true);
    let responseReceived = false;
    try {
      const response = await fetch(url, { method, headers, ...(body !== undefined ? { body: JSON.stringify(body) } : {}) });
      responseReceived = true;
      const text = await response.text();
      let parsed: unknown = text;
      try { parsed = text ? JSON.parse(text) : null; } catch { /* keep non-JSON response as text */ }
      setHttpStatus(response.status);
      setApiResponse(JSON.stringify(parsed, null, 2));
      if (!response.ok) {
        const message = typeof parsed === "object" && parsed !== null && "message" in parsed
          ? String((parsed as { message: unknown }).message)
          : `Request failed with HTTP ${response.status}`;
        throw new Error(message);
      }
      return parsed as Record<string, unknown>;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to reach the Open Banking backend.";
      setApiError(message);
      if (!responseReceived) setApiResponse(JSON.stringify({ error: message }, null, 2));
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const togglePermission = (key: keyof typeof permissions) => {
    setPermissions((previous) => ({ ...previous, [key]: !previous[key] }));
  };

  const startSimulation = async () => {
    setSimulationStarted(true);
    setActiveStep(0);
    setConsentId("");
    setAccessToken("");
    setAisAccounts(null);
    if (flowType !== "ais") return;
    try {
      const result = await callAisApi("POST", "/api/open-banking/ais/consent", aisRequestBody());
      const id = String(result.consentId ?? "");
      if (!id) throw new Error("The backend response did not include consentId.");
      setConsentId(id);
    } catch { /* error is displayed in the API inspector */ }
  };

  const selectFlow = (flow: FlowType) => {
    setFlowType(flow);
    setSimulationStarted(false);
    setActiveStep(0);
    setConsentId("");
    setAccessToken("");
    setApiRequest("");
    setApiResponse("");
    setHttpStatus(null);
    setApiError("");
  };

  const nextStep = async () => {
    if (loading) return;
    if (flowType === "ais") {
      try {
        if (currentStep.id === "consent") {
          if (!consentId) throw new Error("Consent has not been created. Start the simulation again.");
          await callAisApi("POST", `/api/open-banking/ais/${encodeURIComponent(consentId)}/authorize`, aisRequestBody(true));
          setActiveStep(1);
          return;
        }
        if (currentStep.id === "authorize") {
          if (!consentId) throw new Error("Consent ID is missing.");
          const result = await callAisApi("POST", `/api/open-banking/ais/token?consentId=${encodeURIComponent(consentId)}`, aisRequestBody(true));
          const token = String(result.access_token ?? result.accessToken ?? "");
          if (token) setAccessToken(token);
          setActiveStep(2);
          return;
        }
        if (currentStep.id === "token") {
          const result = await callAisApi("GET", `/api/open-banking/ais/accounts?consentId=${encodeURIComponent(consentId)}`);
          setAisAccounts(result);
          setActiveStep(3);
          return;
        }
      } catch { return; }
    } else {
      setApiRequest(requestPayload);
      setApiResponse(responsePayload);
      setHttpStatus(200);
    }
    setSimulationStarted(true);
    setActiveStep((step) => Math.min(step + 1, steps.length - 1));
  };

  const resetSimulation = () => {
    setSimulationStarted(false);
    setActiveStep(0);
    setConsentId("");
    setAccessToken("");
    setApiRequest("");
    setApiResponse("");
    setHttpStatus(null);
    setApiError("");
    setAisAccounts(null);
  };

  return (
    <>
      <SEO
        title="Open Banking Lab | FintechSchema"
        description="Explore interactive simulated Open Banking AIS and PIS flows with FintechSchema."
        path="/open-banking-lab"
      />

      <div className="obl-page">
        <header className="home-header">
          <Link to="/" className="home-brand">
            <span className="home-brand-icon">ISO</span>
            <span>
              <strong>ISO 20022 Validator</strong>
              <small>Fintech Developer Platform</small>
            </span>
          </Link>

          <nav className="home-nav">
            <Link to="/">Home</Link>
            <Link to="/validator">Validator</Link>
            <Link to="/message-generator">Message Generator</Link>
            <Link to="/developer-tools">Developer Tools</Link>
            <Link to="/documentation">Documentation</Link>
            <Link to="/about">About</Link>
          </nav>
        </header>

        <main className="obl-container">
          <section className="obl-heading">
            <div>
              <span className="home-section-eyebrow">OPEN BANKING LAB</span>
              <h1>See how an Open Banking flow actually works.</h1>
              <p>
                Simulate Account Information (AIS) and Payment Initiation (PIS) journeys step by step.
                Inspect each request, response and state transition as you go.
              </p>
            </div>
            <span className="obl-phase-badge">PHASE 1 · SIMULATED</span>
          </section>

          <section className="obl-flow-selector">
            <button className={`obl-flow-option ${flowType === "ais" ? "is-selected" : ""}`} onClick={() => selectFlow("ais")}>
              <span className="obl-flow-option-tag">AIS</span>
              <strong>Account Information</strong>
              <small>Consent → token → account data</small>
            </button>
            <button className={`obl-flow-option ${flowType === "pis" ? "is-selected" : ""}`} onClick={() => selectFlow("pis")}>
              <span className="obl-flow-option-tag">PIS</span>
              <strong>Payment Initiation</strong>
              <small>Create → approve → submit → status</small>
            </button>
          </section>

          {!simulationStarted ? (
            <section className="obl-start-card">
              {flowType === "ais" ? (
                <>
                  <div className="obl-start-copy">
                    <span className="obl-icon">⌁</span>
                    <div>
                      <span className="obl-kicker">ACCOUNT INFORMATION · AIS</span>
                      <h2>Connect a demo bank account</h2>
                      <p>Walk through a realistic consent journey without connecting to a real bank or sharing real customer data.</p>
                    </div>
                  </div>

                  <div className="obl-permissions">
                    <div className="obl-permissions-heading"><strong>Choose requested permissions</strong><span>What the TPP asks the bank to share</span></div>
                    <label className="obl-permission"><input type="checkbox" checked={permissions.accounts} onChange={() => togglePermission("accounts")} /><span><strong>Account details</strong><small>Account identifier and account type</small></span></label>
                    <label className="obl-permission"><input type="checkbox" checked={permissions.balances} onChange={() => togglePermission("balances")} /><span><strong>Balances</strong><small>Current and available balance</small></span></label>
                    <label className="obl-permission"><input type="checkbox" checked={permissions.transactions} onChange={() => togglePermission("transactions")} /><span><strong>Transactions</strong><small>Recent transaction history</small></span></label>
                  </div>
                </>
              ) : (
                <div className="obl-start-copy">
                  <span className="obl-icon">↗</span>
                  <div>
                    <span className="obl-kicker">PAYMENT INITIATION · PIS</span>
                    <h2>Initiate a demo payment</h2>
                    <p>Simulate a payment journey from payment creation and customer consent to submission and final status.</p>
                  </div>
                </div>
              )}

              {flowType === "pis" && (
                <div className="obl-payment-form">
                  <div className="obl-form-field"><label>Amount</label><input value={payment.amount} onChange={(e) => setPayment({ ...payment, amount: e.target.value })} /></div>
                  <div className="obl-form-field"><label>Currency</label><select value={payment.currency} onChange={(e) => setPayment({ ...payment, currency: e.target.value })}><option>EUR</option><option>GBP</option><option>USD</option></select></div>
                  <div className="obl-form-field"><label>Creditor</label><input value={payment.creditor} onChange={(e) => setPayment({ ...payment, creditor: e.target.value })} /></div>
                  <div className="obl-form-field"><label>Reference</label><input value={payment.reference} onChange={(e) => setPayment({ ...payment, reference: e.target.value })} /></div>
                </div>
              )}

              <div className="obl-start-footer"><span>Demo only · No real banking credentials are used</span><button className="obl-primary-button" onClick={startSimulation} disabled={loading}>{loading ? "Connecting…" : "Start simulation →"}</button></div>
            </section>
          ) : (
            <>
              <section className="obl-stepper-card">
                <div className="obl-stepper-header">
                  <div>
                    <span className="obl-kicker">SIMULATION</span>
                    <h2>{flowType === "ais" ? "AIS consent journey" : "PIS payment journey"}</h2>
                  </div>
                  <button className="obl-reset-button" onClick={resetSimulation}>
                    Reset
                  </button>
                </div>

                <div className="obl-stepper">
                  {steps.map((step, index) => (
                    <button
                      key={step.id}
                      className={`obl-step ${index === activeStep ? "is-active" : ""} ${index < activeStep ? "is-complete" : ""}`}
                      onClick={() => setActiveStep(index)}
                    >
                      <span className="obl-step-number">{index < activeStep ? "✓" : step.number}</span>
                      <span className="obl-step-copy">
                        <strong>{step.title}</strong>
                        <small>{step.subtitle}</small>
                      </span>
                    </button>
                  ))}
                </div>
              </section>

              <section className="obl-workspace">
                <div className="obl-flow-card">
                  <div className="obl-card-header">
                    <div>
                      <span className="obl-kicker">CURRENT STEP · {currentStep.number}</span>
                      <h2>{currentStep.title}</h2>
                    </div>
                    <span className="obl-status">● SIMULATED</span>
                  </div>

                  {flowType === "pis" && currentStep.id === "payment-consent" && (
                    <div className="obl-bank-screen">
                      <div className="obl-bank-topline"><span className="obl-bank-mark">FS</span><span>FintechSchema Demo Bank</span></div>
                      <div className="obl-bank-content">
                        <span className="obl-kicker">PAYMENT AUTHORIZATION</span>
                        <h3>Review your payment</h3>
                        <p>FintechSchema Demo wants to initiate this payment from your selected account.</p>
                        <div className="obl-payment-review">
                          <span>{payment.currency} PAYMENT</span><strong>{payment.currency} {payment.amount}</strong><small>To: {payment.creditor}</small><small>Reference: {payment.reference}</small>
                        </div>
                        <div className="obl-bank-actions"><button className="obl-secondary-button" onClick={resetSimulation}>Cancel</button><button className="obl-primary-button" onClick={nextStep}>Approve payment</button></div>
                      </div>
                    </div>
                  )}

                  {flowType === "pis" && currentStep.id === "payment" && (
                    <div className="obl-state-panel"><div className="obl-state-icon">↗</div><span className="obl-kicker">PAYMENT REQUEST</span><h3>Create payment instruction</h3><p>{payment.currency} {payment.amount} to {payment.creditor} with reference {payment.reference}.</p><button className="obl-primary-button" onClick={nextStep}>Create payment →</button></div>
                  )}

                  {flowType === "pis" && currentStep.id === "payment-auth" && (
                    <div className="obl-state-panel"><div className="obl-state-icon">✓</div><span className="obl-kicker">CUSTOMER AUTHENTICATION</span><h3>Authorize the payment</h3><p>The customer has authenticated and approved the payment instruction.</p><button className="obl-primary-button" onClick={nextStep}>Continue →</button></div>
                  )}

                  {flowType === "pis" && currentStep.id === "payment-submit" && (
                    <div className="obl-state-panel"><div className="obl-state-icon">↗</div><span className="obl-kicker">BANK PROCESSING</span><h3>Payment submitted</h3><p>The demo bank accepted the payment instruction and is processing it.</p><button className="obl-primary-button" onClick={nextStep}>Check status →</button></div>
                  )}

                  {flowType === "pis" && currentStep.id === "payment-status" && (
                    <div className="obl-state-panel"><div className="obl-state-icon">✓</div><span className="obl-kicker">FINAL PAYMENT STATUS</span><h3>Payment completed</h3><p>The simulated payment has reached a completed state.</p><div className="obl-account-preview"><span>PAYMENT ID</span><strong>PAY-2026-001</strong><small>Status · AcceptedSettlementCompleted</small></div></div>
                  )}

                  {flowType === "ais" && currentStep.id === "consent" && (
                    <div className="obl-bank-screen">
                      <div className="obl-bank-topline">
                        <span className="obl-bank-mark">FS</span>
                        <span>FintechSchema Demo Bank</span>
                      </div>
                      <div className="obl-bank-content">
                        <span className="obl-kicker">THIRD-PARTY ACCESS</span>
                        <h3>Connect your bank account</h3>
                        <p>
                          FintechSchema Demo wants permission to access selected account information
                          on your behalf.
                        </p>
                        <div className="obl-consent-list">
                          {permissions.accounts && <span>✓ Account details</span>}
                          {permissions.balances && <span>✓ Balances</span>}
                          {permissions.transactions && <span>✓ Transactions</span>}
                        </div>
                        <div className="obl-bank-actions">
                          <button className="obl-secondary-button" onClick={resetSimulation}>Cancel</button>
                          <button className="obl-primary-button" onClick={nextStep} disabled={loading}>{loading ? "Calling backend…" : "Approve access"}</button>
                        </div>
                      </div>
                    </div>
                  )}

                  {flowType === "ais" && currentStep.id !== "consent" && (
                    <div className="obl-state-panel">
                      <div className="obl-state-icon">{currentStep.id === "accounts" ? "✓" : "↗"}</div>
                      <span className="obl-kicker">FINTECHSCHEMA DEMO BANK</span>
                      <h3>{currentStep.title}</h3>
                      <p>
                        {currentStep.id === "authorize" && "The customer has authenticated and approved the requested access."}
                        {currentStep.id === "code" && "The bank returns a short-lived authorization code to the simulated TPP."}
                        {currentStep.id === "token" && "The simulator requests a demo access token after consent authorization. This backend flow does not currently issue a separate authorization code."}
                        {currentStep.id === "accounts" && "The access token is used to retrieve the customer’s demo account information."}
                      </p>
                      {currentStep.id === "authorize" && consentId && <div className="obl-account-preview"><span>CONSENT ID</span><strong>{consentId}</strong><small>Created by the backend</small></div>}
                      {currentStep.id === "token" && accessToken && <div className="obl-account-preview"><span>ACCESS TOKEN</span><strong>{accessToken.slice(0, 18)}…</strong><small>Issued by the backend</small></div>}
                      {currentStep.id === "accounts" && (
                        <div className="obl-account-preview">
                          <span>BACKEND ACCOUNT RESPONSE</span>
                          <strong>{Array.isArray(aisAccounts) ? `${aisAccounts.length} account(s) returned` : "Account data received"}</strong>
                          <small>{accessToken ? "Demo access token issued" : "Token returned by backend"}</small>
                        </div>
                      )}
                      {activeStep < steps.length - 1 && (
                        <button className="obl-primary-button" onClick={nextStep} disabled={loading}>
                          {loading ? "Calling backend…" : "Continue →"}
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <aside className="obl-inspector">
                  <div className="obl-card-header">
                    <div>
                      <span className="obl-kicker">DEVELOPER VIEW</span>
                      <h2>API inspector</h2>
                    </div>
                    <span className="obl-http-status">{httpStatus ? `HTTP ${httpStatus}` : loading ? "CALLING API" : "NOT CALLED"}</span>
                  </div>

                  {apiError && flowType === "ais" && <div role="alert" style={{ margin: "0 0 14px", padding: "12px 14px", borderRadius: 10, color: "#b91c1c", background: "#fef2f2", border: "1px solid #fecaca", fontSize: 13 }}><strong>Backend request failed</strong><div>{apiError}</div></div>}
                  <div className="obl-code-block">
                    <div className="obl-code-title">REQUEST</div>
                    <pre>{displayedRequest}</pre>
                  </div>
                  <div className="obl-code-block">
                    <div className="obl-code-title">RESPONSE</div>
                    <pre>{displayedResponse}</pre>
                  </div>
                </aside>
              </section>

              <section className="obl-event-card">
                <div className="obl-card-header">
                  <div>
                    <span className="obl-kicker">EVENT LOG</span>
                    <h2>What happened</h2>
                  </div>
                  <span>{activeStep + 1} / {steps.length} steps</span>
                </div>
                <div className="obl-events">
                  {steps.slice(0, activeStep + 1).map((step, index) => (
                    <div className="obl-event" key={step.id}>
                      <span className="obl-event-dot">✓</span>
                      <div>
                        <strong>{step.title}</strong>
                        <small>Step {index + 1} completed successfully</small>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}
        </main>

        <footer className="home-footer">
          <span>© 2026 FintechSchema. All rights reserved.</span>
          <span>Open Banking Lab · Simulated for learning and development</span>
        </footer>
      </div>
    </>
  );
}

export default OpenBankingLabPage;
