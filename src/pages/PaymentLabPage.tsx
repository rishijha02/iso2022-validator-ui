import { useState } from "react";
import { Link } from "react-router-dom";
import SEO from "../components/SEO";

type StageStatus = "waiting" | "processing" | "completed" | "failed";
type PaymentStage = { title: string; detail: string; status: StageStatus; duration?: string };

type PaymentForm = {
  debtorName: string;
  debtorAccount: string;
  creditorName: string;
  creditorAccount: string;
  amount: string;
  currency: string;
  reference: string;
  paymentType: string;
  rail: string;
  idempotencyKey: string;
};

const initialForm: PaymentForm = {
  debtorName: "Alex Morgan",
  debtorAccount: "DEMO-ACCOUNT-001",
  creditorName: "Jordan Lee",
  creditorAccount: "DEMO-ACCOUNT-002",
  amount: "250.00",
  currency: "EUR",
  reference: "INV-2026-1042",
  paymentType: "Credit transfer",
  rail: "SEPA Credit Transfer",
  idempotencyKey: "pay-demo-001",
};

const stageTemplates = [
  { title: "Payment initiated", detail: "The payment request was accepted by the simulator.", duration: "12 ms" },
  { title: "Input validation", detail: "Required fields, amount and payment reference checked.", duration: "8 ms" },
  { title: "Risk checks", detail: "Demo risk rules evaluated; no external screening is performed.", duration: "34 ms" },
  { title: "Balance check", detail: "A simulated account balance check passed.", duration: "16 ms" },
  { title: "Payment processing", detail: "The instruction was prepared for the selected payment rail.", duration: "41 ms" },
  { title: "Settlement", detail: "The simulated settlement stage completed.", duration: "96 ms" },
  { title: "Beneficiary credited", detail: "The demo beneficiary account was credited in this simulation.", duration: "11 ms" },
];

function PaymentLabPage() {
  const [form, setForm] = useState<PaymentForm>(initialForm);
  const [stages, setStages] = useState<PaymentStage[]>([]);
  const [paymentId, setPaymentId] = useState("");
  const [running, setRunning] = useState(false);
  const [hasRun, setHasRun] = useState(false);
  const [showTechnical, setShowTechnical] = useState(true);
  const [scenario, setScenario] = useState("success");

  const update = (field: keyof PaymentForm, value: string) => setForm((current) => ({ ...current, [field]: value }));

  const runSimulation = async () => {
    const amount = Number(form.amount);
    if (!Number.isFinite(amount) || amount <= 0 || !form.debtorAccount.trim() || !form.creditorAccount.trim()) return;
    setRunning(true);
    setHasRun(true);
    const id = `PAY-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    setPaymentId(id);
    const isRejected = scenario === "insufficient";
    const isTimeout = scenario === "timeout";
    const items: PaymentStage[] = stageTemplates.map((stage) => ({ ...stage, status: "waiting" as StageStatus }));
    setStages(items);

    for (let index = 0; index < items.length; index += 1) {
      if ((isRejected && index > 3) || (isTimeout && index > 4)) break;
      setStages((current) => current.map((stage, i) => i === index ? { ...stage, status: "processing" } : stage));
      await new Promise((resolve) => window.setTimeout(resolve, 240));
      const failHere = (isRejected && index === 3) || (isTimeout && index === 4);
      setStages((current) => current.map((stage, i) => i === index ? { ...stage, status: failHere ? "failed" : "completed" } : stage));
      if (failHere) break;
    }
    setRunning(false);
  };

  const reset = () => {
    setForm(initialForm);
    setStages([]);
    setPaymentId("");
    setHasRun(false);
    setRunning(false);
    setScenario("success");
  };

  const failed = stages.some((stage) => stage.status === "failed");
  const completed = hasRun && !running && stages.length > 0 && stages.every((stage) => stage.status === "completed");
  const currentStage = stages.find((stage) => stage.status === "processing")?.title ?? (failed ? "Payment needs attention" : completed ? "Payment completed" : "Ready to simulate");
  const requestJson = JSON.stringify({
    debtor: { name: form.debtorName, account: form.debtorAccount },
    creditor: { name: form.creditorName, account: form.creditorAccount },
    instructedAmount: { amount: form.amount, currency: form.currency },
    paymentType: form.paymentType,
    paymentRail: form.rail,
    endToEndReference: form.reference,
    idempotencyKey: form.idempotencyKey,
  }, null, 2);

  const responseJson = hasRun ? JSON.stringify({
    paymentId,
    status: failed ? "REJECTED_OR_INTERRUPTED" : completed ? "COMPLETED" : "PROCESSING",
    rail: form.rail,
    amount: `${form.currency} ${Number(form.amount).toFixed(2)}`,
    reference: form.reference,
    simulation: true,
  }, null, 2) : "Run the simulator to inspect the response.";

  return (
    <>
      <SEO title="Payment Lab | FintechSchema" description="Simulate a payment lifecycle and inspect processing stages, events and technical details with FintechSchema." path="/payment-lab" />
      <div className="obl-page payment-lab-page">
        <header className="home-header">
          <Link to="/" className="home-brand">
            <span className="home-brand-icon">ISO</span>
            <span><strong>FintechSchema</strong><small>Fintech Developer Platform</small></span>
          </Link>
          <nav className="home-nav">
            <Link to="/">Home</Link><Link to="/validator">Validator</Link><Link to="/message-generator">Message Generator</Link><Link to="/open-banking-lab">Open Banking Lab</Link><Link to="/payment-lab">Payment Lab</Link><Link to="/developer-tools">Developer Tools</Link>
          </nav>
        </header>

        <main className="paymentlab-container">
          <section className="paymentlab-hero">
            <div>
              <div className="paymentlab-eyebrow"><span className="paymentlab-live-dot" /> PAYMENT LAB <span className="paymentlab-phase">MODULE 01 · SIMULATOR</span></div>
              <h1>Follow a payment.<br /><span>Understand every step.</span></h1>
              <p>Initiate a demo payment and explore how it moves through validation, risk checks, processing and settlement—with a developer view of every event.</p>
              <div className="paymentlab-hero-points"><span>✓ No real money moves</span><span>✓ No bank connection</span><span>✓ Built for learning</span></div>
            </div>
            <div className="paymentlab-hero-visual" aria-hidden="true">
              <div className="paymentlab-orbit paymentlab-orbit-one" /><div className="paymentlab-orbit paymentlab-orbit-two" />
              <div className="paymentlab-visual-core"><span>↗</span><strong>PAY</strong><small>PAYMENT FLOW</small></div>
              <div className="paymentlab-float paymentlab-float-top"><span>✓</span><div><b>Validated</b><small>Request accepted</small></div></div>
              <div className="paymentlab-float paymentlab-float-bottom"><span>⇄</span><div><b>SEPA SCT</b><small>Payment rail</small></div></div>
            </div>
          </section>

          <section className="paymentlab-workspace">
            <div className="paymentlab-section-heading"><div><span className="paymentlab-kicker">01 / CONFIGURE</span><h2>Build your payment</h2><p>Use demo values or enter your own test data.</p></div><button className="paymentlab-reset" onClick={reset} disabled={running}>↺ Reset</button></div>
            <div className="paymentlab-main-grid">
              <section className="paymentlab-card paymentlab-form-card">
                <div className="paymentlab-card-title"><span className="paymentlab-title-icon">↗</span><div><h3>Payment instruction</h3><p>Define sender, beneficiary and payment details.</p></div></div>
                <div className="paymentlab-form-section"><div className="paymentlab-form-section-title"><span>01</span> Debtor · Who sends the payment?</div>
                  <div className="paymentlab-field-grid"><label>Debtor name<input value={form.debtorName} onChange={(e) => update("debtorName", e.target.value)} placeholder="Sender name" /></label><label>Debtor account / IBAN<input value={form.debtorAccount} onChange={(e) => update("debtorAccount", e.target.value)} placeholder="Demo account or IBAN" /></label></div>
                </div>
                <div className="paymentlab-form-section"><div className="paymentlab-form-section-title"><span>02</span> Creditor · Who receives it?</div>
                  <div className="paymentlab-field-grid"><label>Creditor name<input value={form.creditorName} onChange={(e) => update("creditorName", e.target.value)} placeholder="Beneficiary name" /></label><label>Creditor account / IBAN<input value={form.creditorAccount} onChange={(e) => update("creditorAccount", e.target.value)} placeholder="Demo account or IBAN" /></label></div>
                </div>
                <div className="paymentlab-form-section"><div className="paymentlab-form-section-title"><span>03</span> Payment details</div>
                  <div className="paymentlab-field-grid paymentlab-amount-grid"><label>Amount<input type="number" min="0.01" step="0.01" value={form.amount} onChange={(e) => update("amount", e.target.value)} /></label><label>Currency<select value={form.currency} onChange={(e) => update("currency", e.target.value)}><option>EUR</option><option>USD</option><option>GBP</option><option>ILS</option><option>INR</option></select></label><label>Payment type<select value={form.paymentType} onChange={(e) => update("paymentType", e.target.value)}><option>Credit transfer</option><option>Instant payment</option><option>Cross-border payment</option></select></label><label>Payment rail<select value={form.rail} onChange={(e) => update("rail", e.target.value)}><option>SEPA Credit Transfer</option><option>SEPA Instant Credit Transfer</option><option>SWIFT cross-border</option><option>UPI (educational demo)</option></select></label><label className="paymentlab-full-field">Payment reference<input value={form.reference} onChange={(e) => update("reference", e.target.value)} placeholder="e.g. invoice number" /></label><label className="paymentlab-full-field">Idempotency key <span className="paymentlab-inline-hint">Used to identify retries</span><input value={form.idempotencyKey} onChange={(e) => update("idempotencyKey", e.target.value)} placeholder="Unique request key" /></label></div>
                </div>
                <div className="paymentlab-form-section paymentlab-scenario-section"><div className="paymentlab-form-section-title"><span>04</span> Simulation scenario</div><label className="paymentlab-scenario-label">Choose how this demo behaves<select value={scenario} onChange={(e) => setScenario(e.target.value)} disabled={running}><option value="success">Successful payment</option><option value="insufficient">Insufficient funds at balance check</option><option value="timeout">Payment rail timeout</option></select></label><p className="paymentlab-note">Scenarios are simulated locally. They do not call a bank or move real funds.</p></div>
                <div className="paymentlab-form-actions"><button className="paymentlab-run-button" onClick={runSimulation} disabled={running || !form.amount || Number(form.amount) <= 0 || !form.debtorAccount.trim() || !form.creditorAccount.trim()}>{running ? <><span className="paymentlab-spinner" /> Running simulation…</> : <>Run payment simulation <span>→</span></>}</button><span className="paymentlab-action-caption">Typically completes in under 2 seconds</span></div>
              </section>

              <div className="paymentlab-right-column">
                <section className="paymentlab-card paymentlab-lifecycle-card">
                  <div className="paymentlab-card-title paymentlab-lifecycle-heading"><span className="paymentlab-title-icon">⌁</span><div><h3>Payment lifecycle</h3><p>{hasRun ? currentStage : "Your payment journey will appear here."}</p></div><span className={`paymentlab-status-pill ${completed ? "is-success" : failed ? "is-failed" : running ? "is-running" : "is-idle"}`}>{running ? "IN PROGRESS" : completed ? "COMPLETED" : failed ? "INTERRUPTED" : "READY"}</span></div>
                  {hasRun && <div className="paymentlab-payment-id"><span>PAYMENT ID</span><strong>{paymentId}</strong><button onClick={() => navigator.clipboard?.writeText(paymentId)} aria-label="Copy payment ID">Copy</button></div>}
                  <div className="paymentlab-timeline">
                    {(hasRun ? stages : stageTemplates.map((stage) => ({ ...stage, status: "waiting" as StageStatus }))).map((stage, index) => <div className={`paymentlab-stage stage-${stage.status}`} key={stage.title}><div className="paymentlab-stage-rail"><span className="paymentlab-stage-icon">{stage.status === "completed" ? "✓" : stage.status === "failed" ? "!" : stage.status === "processing" ? "·" : String(index + 1).padStart(2, "0")}</span>{index < stageTemplates.length - 1 && <span className="paymentlab-stage-line" />}</div><div className="paymentlab-stage-content"><div className="paymentlab-stage-heading"><strong>{stage.title}</strong>{stage.status !== "waiting" && <span>{stage.status === "completed" ? stage.duration : stage.status === "failed" ? "FAILED" : "RUNNING"}</span>}</div><p>{stage.status === "failed" && scenario === "insufficient" ? "The demo balance check did not pass. No payment was sent." : stage.status === "failed" && scenario === "timeout" ? "The simulated payment rail did not respond before the timeout." : stage.detail}</p></div></div>)}
                  </div>
                  {!hasRun && <div className="paymentlab-empty-hint"><span>↳</span> Complete the form and run a simulation to see live stage updates.</div>}
                </section>

                <section className="paymentlab-card paymentlab-details-card">
                  <div className="paymentlab-card-title"><span className="paymentlab-title-icon">▤</span><div><h3>Payment summary</h3><p>Key details for this instruction.</p></div></div>
                  <div className="paymentlab-summary-amount"><span>PAYMENT AMOUNT</span><strong>{form.currency} {Number(form.amount || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong><small>{form.rail}</small></div>
                  <div className="paymentlab-summary-row"><span>From</span><strong>{form.debtorName || "—"}</strong></div><div className="paymentlab-summary-row"><span>To</span><strong>{form.creditorName || "—"}</strong></div><div className="paymentlab-summary-row"><span>Reference</span><strong>{form.reference || "—"}</strong></div><div className="paymentlab-summary-row"><span>Payment type</span><strong>{form.paymentType}</strong></div>
                </section>
              </div>
            </div>
          </section>

          <section className="paymentlab-technical-section"><div className="paymentlab-section-heading"><div><span className="paymentlab-kicker">02 / INSPECT</span><h2>Developer inspector</h2><p>See the request structure and the simulated response.</p></div><button className="paymentlab-reset" onClick={() => setShowTechnical((value) => !value)}>{showTechnical ? "Hide details −" : "Show details +"}</button></div>
            {showTechnical && <div className="paymentlab-tech-grid"><div className="paymentlab-code-card"><div className="paymentlab-code-heading"><span><i /> REQUEST PAYLOAD</span><button onClick={() => navigator.clipboard?.writeText(requestJson)}>Copy JSON</button></div><pre>{requestJson}</pre></div><div className="paymentlab-code-card"><div className="paymentlab-code-heading"><span><i className={hasRun ? "is-response" : ""} /> SIMULATED RESPONSE</span><span className="paymentlab-code-status">{completed ? "200 OK" : failed ? "422 / TIMEOUT" : hasRun ? "PROCESSING" : "WAITING"}</span></div><pre>{responseJson}</pre></div></div>}
          </section>
          {hasRun && <section className="paymentlab-events-section"><div className="paymentlab-section-heading"><div><span className="paymentlab-kicker">03 / EVENT LOG</span><h2>Processing events</h2><p>A chronological view of the simulated payment journey.</p></div><span className="paymentlab-event-count">{stages.filter((stage) => stage.status === "completed" || stage.status === "failed").length} events</span></div><div className="paymentlab-event-list">{stages.filter((stage) => stage.status === "completed" || stage.status === "failed").map((stage, index) => <div className="paymentlab-event-row" key={stage.title}><span className={stage.status === "failed" ? "is-error" : ""}>{stage.status === "failed" ? "!" : "✓"}</span><div><strong>{stage.title}</strong><small>{stage.detail}</small></div><time>+{index === 0 ? "0" : index * 24} ms</time></div>)}</div></section>}
          <div className="paymentlab-disclaimer"><span>ⓘ</span><p><strong>Simulation environment.</strong> Payment statuses, timings and responses are illustrative only. This tool does not connect to banks, payment networks or real customer accounts.</p></div>
        </main>
        <footer className="home-footer"><span>© 2026 FintechSchema. All rights reserved.</span><span>Payment Lab · Simulated for learning and development</span></footer>
      </div>
    </>
  );
}

export default PaymentLabPage;
