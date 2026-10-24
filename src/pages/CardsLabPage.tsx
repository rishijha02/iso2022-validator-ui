import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import SEO from "../components/SEO";

type Channel = "ATM" | "POS" | "E-commerce";
type Outcome = "approved" | "declined" | "timeout" | "cash-failure";

function buildStages(channel: Channel, outcome: Outcome) {
  const stages = channel === "ATM"
    ? [
        ["Card & PIN validation", "The ATM reads the chip/card data and validates the PIN through the simulated issuer path."],
        ["Authorization request", "The ATM/acquirer sends an authorization request through the card network to the issuer."],
        ["Issuer decision", outcome === "declined" ? "Issuer declines the withdrawal because the simulated available balance is insufficient." : outcome === "timeout" ? "No response arrives within the simulated timeout window; the final status is uncertain." : "Issuer approves the withdrawal and places a hold for the requested amount."],
        ["Cash dispense", outcome === "cash-failure" ? "The ATM cannot dispense the requested cash. A reversal/advice flow should be initiated." : outcome === "approved" ? "The ATM dispenses the requested cash." : "Cash is not dispensed because the transaction was not approved."],
        ["Completion / reversal handling", outcome === "cash-failure" ? "The ATM/acquirer sends a reversal or advice message so the issuer can release or reconcile the authorization hold." : outcome === "approved" ? "The ATM records a successful withdrawal; clearing and settlement occur later." : "No successful cash withdrawal is recorded. Reconcile uncertain outcomes before retrying."],
      ]
    : [
        ["Card data & authentication", channel === "POS" ? "The terminal reads chip/contactless card data and performs applicable cardholder verification." : "The merchant submits card details/token and applicable authentication data."],
        ["Authorization request", "The acquirer routes the authorization request through the card network to the issuing bank."],
        ["Issuer decision", outcome === "declined" ? "Issuer declines the transaction due to the selected insufficient-funds scenario." : outcome === "timeout" ? "The issuer response times out; the merchant should check status before retrying." : "Issuer approves and may place an authorization hold."],
        ["Merchant response", outcome === "approved" ? "Approval is returned to the terminal or merchant checkout." : "The merchant receives a decline or an uncertain result and follows safe recovery procedures."],
        ["Capture & settlement", outcome === "approved" ? "Capture/clearing and settlement follow according to the merchant and scheme process." : "No successful capture is simulated. A timeout may require status inquiry or reversal handling."],
      ];
  return stages.map(([title, detail], index) => ({ title, detail, state: index < 2 ? "complete" : index === 2 ? (outcome === "approved" ? "complete" : outcome === "timeout" ? "pending" : "attention") : "later" }));
}

export default function CardsLabPage() {
  const [channel, setChannel] = useState<Channel>("ATM");
  const [outcome, setOutcome] = useState<Outcome>("approved");
  const [amount, setAmount] = useState("200");
  const [currency, setCurrency] = useState("USD");
  const [runId, setRunId] = useState(0);
  const stages = useMemo(() => buildStages(channel, outcome), [channel, outcome, runId]);
  const formattedAmount = `${currency} ${Math.max(0, Number(amount) || 0).toFixed(2)}`;
  const result = outcome === "approved" ? "APPROVED" : outcome === "timeout" ? "UNKNOWN / TIMEOUT" : "DECLINED / INTERRUPTED";

  return <>
    <SEO title="Cards Lab | FintechSchema" description="Explore simulated card authorization, ATM cash withdrawals, reversals and card transaction processing." path="/cards-lab" />
    <div className="obl-page payment-lab-page cards-lab-page">
      <header className="home-header">
        <Link to="/" className="home-brand"><span className="home-brand-icon">ISO</span><span><strong>FintechSchema</strong><small>Fintech Developer Platform</small></span></Link>
        <nav className="home-nav"><Link to="/">Home</Link><Link to="/validator">Validator</Link><Link to="/message-generator">Message Generator</Link><Link to="/open-banking-lab">Open Banking Lab</Link><Link to="/payment-lab">Payment Simulator</Link><Link to="/payment-rail-explorer">Rail Explorer</Link><Link to="/cards-lab" aria-current="page">Cards Lab</Link><Link to="/developer-tools">Developer Tools</Link></nav>
      </header>
      <main className="paymentlab-container cardslab-container">
        <section className="paymentlab-hero cardslab-hero">
          <div>
            <div className="paymentlab-eyebrow"><span className="paymentlab-live-dot" /> CARD PAYMENTS <span className="paymentlab-phase">FRONTEND SIMULATOR</span></div>
            <h1>Explore card payments.<br /><span>From authorization to outcome.</span></h1>
            <p>Simulate ATM withdrawals, point-of-sale purchases and e-commerce payments. Follow the issuer decision, understand timeouts and learn why reversals matter.</p>
            <div className="paymentlab-hero-points"><span>✓ No real card data</span><span>✓ No bank connection</span><span>✓ No backend required</span></div>
          </div>
          <div className="cardslab-hero-card" aria-hidden="true"><div className="cardslab-chip">▦</div><div className="cardslab-card-number">•••• &nbsp; •••• &nbsp; •••• &nbsp; 2048</div><div className="cardslab-card-bottom"><span>DEMO CARD</span><strong>FINTECHSCHEMA</strong></div><div className="cardslab-card-orbit" /></div>
        </section>

        <section className="cardslab-workspace">
          <div className="paymentlab-section-heading"><div><span className="paymentlab-kicker">01 / CONFIGURE</span><h2>Authorization simulator</h2><p>Choose a channel and issuer outcome to inspect the simulated processing flow.</p></div><span className="cardslab-demo-pill">DEMO ONLY</span></div>
          <div className="cardslab-channel-tabs" role="tablist" aria-label="Transaction channel">
            {(["ATM", "POS", "E-commerce"] as Channel[]).map(item => <button key={item} type="button" role="tab" aria-selected={channel === item} className={channel === item ? "is-active" : ""} onClick={() => { setChannel(item); setOutcome("approved"); }}>{item === "ATM" ? "▣" : item === "POS" ? "▤" : "◎"}<span>{item === "ATM" ? "ATM withdrawal" : item === "POS" ? "Point of sale" : "E-commerce"}</span></button>)}
          </div>
          <div className="cardslab-grid">
            <section className="cardslab-panel">
              <h3>Transaction details</h3>
              <label className="cardslab-label" htmlFor="cards-amount">{channel === "ATM" ? "Withdrawal amount" : "Purchase amount"}</label>
              <div className="cardslab-amount-row"><select aria-label="Currency" value={currency} onChange={e => setCurrency(e.target.value)}><option>USD</option><option>EUR</option><option>GBP</option><option>ILS</option></select><input id="cards-amount" type="number" min="1" max="10000" value={amount} onChange={e => setAmount(e.target.value)} /></div>
              <label className="cardslab-label" htmlFor="cards-outcome">Simulated issuer / terminal outcome</label>
              <select id="cards-outcome" className="cardslab-select" value={outcome} onChange={e => setOutcome(e.target.value as Outcome)}>
                <option value="approved">Approved</option><option value="declined">Declined — insufficient funds</option><option value="timeout">Issuer timeout</option>{channel === "ATM" && <option value="cash-failure">Cash dispense failure after approval</option>}
              </select>
              {channel === "ATM" && <div className="cardslab-info"><strong>ATM-specific behavior</strong><p>Approval does not guarantee cash was dispensed. If the dispenser fails after approval, the ATM/acquirer may send a reversal or advice message and reconcile the cash journal.</p></div>}
              <button type="button" className="cardslab-run-button" onClick={() => setRunId(id => id + 1)}>Run simulation <span>→</span></button>
            </section>
            <section className="cardslab-panel cardslab-result-panel" aria-live="polite">
              <div className="cardslab-result-top"><div><span className="paymentlab-kicker">SIMULATED RESPONSE</span><h3>Authorization result</h3></div><span className={`cardslab-status ${outcome === "approved" ? "status-approved" : outcome === "timeout" ? "status-timeout" : "status-declined"}`}>{result}</span></div>
              <div className="cardslab-amount-display">{formattedAmount}</div>
              <div className="cardslab-result-meta"><span>Channel<strong>{channel}</strong></span><span>Reference<strong>CS-{String(1042 + runId).padStart(6, "0")}</strong></span><span>Mode<strong>Simulated</strong></span></div>
              <p className="cardslab-result-note">{outcome === "approved" ? "Authorization approved. For ATM withdrawals, cash dispensing is a separate physical step; for purchases, capture and settlement may follow later." : outcome === "declined" ? "The simulated issuer declined the request. Do not treat a decline as a successful authorization." : outcome === "timeout" ? "The response is unknown due to timeout. In real systems, query transaction status or follow scheme/acquirer guidance before retrying." : "Authorization was approved but cash dispensing failed. Reversal/advice and reconciliation help prevent the cardholder from remaining charged for cash not received."}</p>
            </section>
          </div>
        </section>

        <section className="cardslab-flow-section">
          <div className="paymentlab-section-heading"><div><span className="paymentlab-kicker">02 / TRACE THE FLOW</span><h2>{channel === "ATM" ? "ATM withdrawal lifecycle" : channel === "POS" ? "POS purchase lifecycle" : "E-commerce card lifecycle"}</h2><p>Follow each processing stage and understand what happens behind the scenes.</p></div></div>
          <div className="cardslab-timeline">{stages.map((stage, index) => <article className="cardslab-stage" key={`${stage.title}-${index}`}><div className={`cardslab-stage-marker stage-${stage.state}`}>{stage.state === "complete" ? "✓" : stage.state === "attention" ? "!" : stage.state === "pending" ? "…" : String(index + 1).padStart(2, "0")}</div><div className="cardslab-stage-content"><div className="cardslab-stage-heading"><h3>{stage.title}</h3><span className={`cardslab-stage-state stage-label-${stage.state}`}>{stage.state === "complete" ? "Completed" : stage.state === "attention" ? "Needs attention" : stage.state === "pending" ? "Pending / uncertain" : "Next stage"}</span></div><p>{stage.detail}</p></div></article>)}</div>
        </section>
        <section className="cardslab-footer-note"><strong>Important</strong><p>This is an educational simulation using local frontend state and sample outcomes. It does not send authorization messages, use real card data, contact an issuer or perform financial transactions. Actual flows and message types vary by network, acquirer, issuer and ATM/POS implementation.</p></section>
      </main>
      <footer className="home-footer"><span>© 2026 FintechSchema. All rights reserved.</span><span>Cards Lab · Simulated for learning and development</span></footer>
    </div>
  </>;
}
