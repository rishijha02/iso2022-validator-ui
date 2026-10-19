import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import SEO from "../components/SEO";
import { paymentRails, type RailId } from "../data/paymentRails";
import { paymentMessageExamples } from "../data/paymentMessages";


const scenarios = [
  { id: "timeout", label: "Response timeout", where: "After a request is sent", status: "UNKNOWN / PENDING", advice: "Do not blindly resend. Query the original transaction using its reference or idempotency key, then reconcile the authoritative status." },
  { id: "reject", label: "Payment rejected", where: "Validation or receiving-bank decision", status: "REJECTED", advice: "Capture the returned reason code, show a user-safe explanation, and correct the underlying issue before initiating a new payment." },
  { id: "duplicate", label: "Duplicate request", where: "Request intake", status: "DUPLICATE SUSPECTED", advice: "Use an idempotency key or stable end-to-end reference and check whether the original request already created a payment." },
];

function PaymentRailExplorerPage() {
  const [selectedRail, setSelectedRail] = useState<RailId>("sct-inst");
  const [activeStage, setActiveStage] = useState(0);
  const [activeTab, setActiveTab] = useState<"flow" | "compare" | "failures" | "simulation">("flow");
  const [amount, setAmount] = useState("100.00");
  const [reference, setReference] = useState("PAY-2026-0001");
  const [simulationOutcome, setSimulationOutcome] = useState<"success" | "timeout" | "reject" | "duplicate">("success");
  const [simulationRun, setSimulationRun] = useState(false);
  const [scenarioId, setScenarioId] = useState("timeout");
  const rails = paymentRails;
  const rail = rails.find((item) => item.id === selectedRail) ?? rails[0];
  const stage = rail.stages[activeStage] ?? rail.stages[0];
  const scenario = scenarios.find((item) => item.id === scenarioId) ?? scenarios[0];
  const comparison = useMemo(() => rails.map((item) => ({ ...item })), []);
  const [selectedMessageId, setSelectedMessageId] = useState("");
  const stageMessageIds = useMemo(() => {
    if (rail.id === "upi" || rail.id === "fedwire") return [];
    const messageText = stage.messages.join(" ").toLowerCase();
    const ids = ["pain.001", "pacs.008", "pacs.002", "pacs.004"].filter((id) => messageText.includes(id));
    return ids;
  }, [rail.id, stage]);
  const selectedMessage = stageMessageIds.includes(selectedMessageId)
    ? paymentMessageExamples[selectedMessageId]
    : paymentMessageExamples[stageMessageIds[0]];

  const chooseRail = (id: RailId) => { setSelectedRail(id); setActiveStage(0); setSelectedMessageId(""); setSimulationRun(false); };
  const runSimulation = () => { setSimulationRun(true); setActiveStage(simulationOutcome === "success" ? rail.stages.length - 1 : Math.min(2, rail.stages.length - 1)); };

  return (
    <>
      <SEO title="Payment Rail Explorer | FintechSchema" description="Explore payment rails, compare their characteristics, inspect payment flows and learn about failure handling." path="/payment-rail-explorer" />
      <div className="obl-page payment-lab-page rail-explorer-page">
        <header className="home-header">
          <Link to="/" className="home-brand"><span className="home-brand-icon">ISO</span><span><strong>FintechSchema</strong><small>Fintech Developer Platform</small></span></Link>
          <nav className="home-nav"><Link to="/">Home</Link><Link to="/validator">Validator</Link><Link to="/open-banking-lab">Open Banking Lab</Link><Link to="/payment-lab">Payment Simulator</Link><Link to="/payment-rail-explorer">Rail Explorer</Link><Link to="/developer-tools">Developer Tools</Link></nav>
        </header>
        <main className="paymentlab-container rail-explorer-container">
          <section className="paymentlab-hero rail-explorer-hero">
            <div>
              <div className="paymentlab-eyebrow"><span className="paymentlab-live-dot" /> PAYMENT LAB <span className="paymentlab-phase">MODULE 02 · RAIL EXPLORER</span></div>
              <h1>Every payment has<br /><span>a route to follow.</span></h1>
              <p>Explore how payment networks and schemes move instructions between institutions. Compare rails, inspect each stage and learn how failures should be handled.</p>
              <div className="paymentlab-hero-points"><span>✓ Five payment rails</span><span>✓ Clickable flow stages</span><span>✓ Developer-focused details</span></div>
              <div className="rail-hero-actions"><Link to="/payment-lab" className="rail-secondary-button">← Back to Payment Simulator</Link></div>
            </div>
            <div className="rail-hero-visual" aria-hidden="true"><div className="rail-visual-orbit" /><div className="rail-visual-node rail-node-a">PAYER</div><div className="rail-visual-node rail-node-b">BANK</div><div className="rail-visual-node rail-node-c">NETWORK</div><div className="rail-visual-node rail-node-d">PAYEE</div><div className="rail-visual-line rail-line-a" /><div className="rail-visual-line rail-line-b" /><div className="rail-visual-line rail-line-c" /><div className="rail-visual-center">⇄</div><span className="rail-visual-caption">PAYMENT ROUTING</span></div>
          </section>

          <section className="rail-selector-section">
            <div className="paymentlab-section-heading"><div><span className="paymentlab-kicker">01 / CHOOSE A RAIL</span><h2>Explore payment networks</h2><p>Select a rail to see its flow and technical context.</p></div></div>
            <div className="rail-selector-grid">{rails.map((item) => <button key={item.id} className={`rail-selector-card ${item.id === selectedRail ? "is-selected" : ""}`} onClick={() => chooseRail(item.id)} aria-pressed={item.id === selectedRail}><span className="rail-selector-code">{item.short}</span><strong>{item.name}</strong><span>{item.region} · {item.currency}</span><b>{item.id === selectedRail ? "Selected ✓" : "Explore rail →"}</b></button>)}</div>
          </section>

          <section className="rail-overview-card">
            <div className="rail-overview-top"><div><span className="paymentlab-kicker">SELECTED PAYMENT RAIL</span><h2>{rail.name}</h2><p>{rail.summary}</p></div><span className="rail-overview-badge">{rail.short}</span></div>
            <div className="rail-metadata-grid"><div><span>Geography</span><strong>{rail.region}</strong></div><div><span>Currency context</span><strong>{rail.currency}</strong></div><div><span>Typical speed</span><strong>{rail.speed}</strong></div><div><span>Payment model</span><strong>{rail.model}</strong></div><div className="rail-meta-wide"><span>Message / standards context</span><strong>{rail.standard}</strong></div></div>
          </section>

          <section className="rail-explorer-workspace">
            <div className="rail-tab-row" role="tablist" aria-label="Payment rail explorer views"><button role="tab" aria-selected={activeTab === "flow"} className={activeTab === "flow" ? "is-active" : ""} onClick={() => setActiveTab("flow")}>Payment flow</button><button role="tab" aria-selected={activeTab === "compare"} className={activeTab === "compare" ? "is-active" : ""} onClick={() => setActiveTab("compare")}>Compare rails</button><button role="tab" aria-selected={activeTab === "failures"} className={activeTab === "failures" ? "is-active" : ""} onClick={() => setActiveTab("failures")}>Failure scenarios</button><button role="tab" aria-selected={activeTab === "simulation"} className={activeTab === "simulation" ? "is-active" : ""} onClick={() => setActiveTab("simulation")}>Run simulation</button></div>
            {activeTab === "flow" && <div className="rail-flow-layout"><section className="paymentlab-card rail-flow-card"><div className="paymentlab-card-title"><span className="paymentlab-title-icon">⇄</span><div><h3>{rail.short} payment journey</h3><p>Choose a stage to inspect what happens there.</p></div></div><div className="rail-flow-timeline">{rail.stages.map((item, index) => <button key={item.title} className={`rail-flow-stage ${index === activeStage ? "is-active" : ""}`} onClick={() => setActiveStage(index)} aria-pressed={index === activeStage}><span className="rail-flow-stage-number">{String(index + 1).padStart(2, "0")}</span><span className="rail-flow-stage-text"><strong>{item.title}</strong><small>{item.subtitle}</small></span><span className="rail-flow-chevron">{index === activeStage ? "●" : "›"}</span></button>)}</div><p className="rail-flow-footnote">Conceptual flow only. Actual routing depends on scheme rules, participating institutions and service configuration.</p></section>
              <section className="paymentlab-card rail-stage-detail"><div className="rail-detail-top"><span className="paymentlab-kicker">STAGE {String(activeStage + 1).padStart(2, "0")} / {String(rail.stages.length).padStart(2, "0")}</span><span className="rail-detail-pill">{rail.short}</span></div><h3>{stage.title}</h3><p className="rail-stage-subtitle">{stage.subtitle}</p><p className="rail-stage-description">{stage.description}</p><div className="rail-detail-block"><h4>Systems involved</h4><div className="rail-tag-list">{stage.systems.map((system) => <span key={system}>{system}</span>)}</div></div><div className="rail-detail-block"><h4>Messages and standards</h4><ul>{stage.messages.map((message) => <li key={message}>{message}</li>)}</ul></div><div className="rail-failure-note"><strong>What can go wrong?</strong><p>{stage.failure}</p></div>
                <section className="payment-message-inspector" aria-label="ISO 20022 message inspector">
                  <div className="payment-message-heading"><div><span className="paymentlab-kicker">MESSAGE INSPECTOR</span><h4>ISO 20022 message example</h4></div><span className="payment-message-local-tag">Local sample</span></div>
                  {stageMessageIds.length > 0 && selectedMessage ? <>
                    <label className="payment-message-select-label">Choose a message
                      <select value={stageMessageIds.includes(selectedMessageId) ? selectedMessageId : stageMessageIds[0]} onChange={(event) => setSelectedMessageId(event.target.value)}>
                        {stageMessageIds.map((id) => <option key={id} value={id}>{id} — {paymentMessageExamples[id]?.name ?? id}</option>)}
                      </select>
                    </label>
                    <p className="payment-message-purpose">{selectedMessage.purpose}</p>
                    <pre className="payment-message-xml"><code>{selectedMessage.xml}</code></pre>
                    <div className="payment-message-actions"><button type="button" onClick={() => { void navigator.clipboard?.writeText(selectedMessage.xml); }}>Copy XML</button><span>Illustrative excerpt · not a complete schema-valid document</span></div>
                    <div className="payment-message-fields"><h5>Key fields</h5>{selectedMessage.fields.map((field) => <div className="payment-message-field" key={field.path}><code>{field.path}</code><span>{field.meaning}</span></div>)}</div>
                    <p className="payment-message-applicability"><strong>Applicability:</strong> {selectedMessage.applicability}</p>
                  </> : <div className="payment-message-not-applicable"><strong>No generic ISO 20022 example for this stage</strong><p>{rail.id === "upi" ? "UPI uses NPCI-defined interfaces and transaction formats; ISO 20022 messages should not be assumed to represent its native flow." : rail.id === "fedwire" ? "Fedwire has its own service message formats and migration requirements. This explorer does not substitute a generic ISO 20022 snippet for those specifications." : "The selected stage does not reference one of the included message examples. Message use depends on the specific scheme and implementation."}</p></div>}
                </section>
                <div className="rail-stage-controls"><button onClick={() => setActiveStage((value) => Math.max(0, value - 1))} disabled={activeStage === 0}>← Previous</button><button onClick={() => setActiveStage((value) => Math.min(rail.stages.length - 1, value + 1))} disabled={activeStage === rail.stages.length - 1}>Next stage →</button></div></section></div>}
            {activeTab === "compare" && <div className="paymentlab-card rail-comparison-card"><div className="paymentlab-card-title"><span className="paymentlab-title-icon">▦</span><div><h3>Compare payment rails</h3><p>Compare the purpose and operating context, not just speed.</p></div></div><div className="rail-comparison-table-wrap"><table className="rail-comparison-table"><thead><tr><th>Rail</th><th>Region</th><th>Currency</th><th>Typical use</th><th>Model</th><th>Standards context</th></tr></thead><tbody>{comparison.map((item) => <tr key={item.id} className={item.id === selectedRail ? "is-current" : ""}><td><button className="rail-table-select" onClick={() => { chooseRail(item.id); setActiveTab("flow"); }}>{item.name} ↗</button></td><td>{item.region}</td><td>{item.currency}</td><td>{item.useCase}</td><td>{item.model}</td><td>{item.standard}</td></tr>)}</tbody></table></div><p className="rail-flow-footnote">Processing speed, availability, fees and finality vary by scheme rules, participating institutions, operating windows and the specific route.</p></div>}
            {activeTab === "simulation" && <div className="rail-simulation-layout"><section className="paymentlab-card rail-simulation-form"><div className="paymentlab-card-title"><span className="paymentlab-title-icon">▶</span><div><h3>Simulate a {rail.short} payment</h3><p>Run a local, illustrative journey. No payment is sent to a bank or network.</p></div></div><label className="rail-form-field">Amount ({rail.currency})<input type="number" min="0.01" step="0.01" value={amount} onChange={(event) => { setAmount(event.target.value); setSimulationRun(false); }} /></label><label className="rail-form-field">Payment reference<input value={reference} onChange={(event) => { setReference(event.target.value); setSimulationRun(false); }} maxLength={50} /></label><label className="rail-form-field">Scenario<select value={simulationOutcome} onChange={(event) => { setSimulationOutcome(event.target.value as typeof simulationOutcome); setSimulationRun(false); }}><option value="success">Successful processing</option><option value="timeout">Response timeout — unknown outcome</option><option value="reject">Business rejection</option><option value="duplicate">Duplicate request detected</option></select></label><button className="paymentlab-run-button rail-simulation-run" onClick={runSimulation} disabled={!Number.isFinite(Number(amount)) || Number(amount) <= 0 || !reference.trim()}>Run simulation →</button></section><section className="paymentlab-card rail-simulation-results"><span className="paymentlab-kicker">SIMULATION OUTPUT</span><h3>{simulationRun ? (simulationOutcome === "success" ? "Payment completed" : simulationOutcome === "timeout" ? "Outcome unknown" : simulationOutcome === "reject" ? "Payment rejected" : "Duplicate detected") : "Ready to simulate"}</h3><div className="rail-simulation-meta"><span>Rail<strong>{rail.short}</strong></span><span>Amount<strong>{rail.currency} {Number(amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></span><span>Reference<strong>{reference || "—"}</strong></span></div>{simulationRun ? <><div className="rail-simulation-timeline">{rail.stages.map((item, index) => { const failedAt = simulationOutcome === "success" ? rail.stages.length : simulationOutcome === "timeout" ? Math.min(3, rail.stages.length) : simulationOutcome === "reject" ? 2 : 1; const reached = index < failedAt; const failed = index === failedAt - 1 && simulationOutcome !== "success"; return <div className={`rail-simulation-step ${reached ? "is-complete" : ""} ${failed ? "is-problem" : ""}`} key={item.title}><span>{failed ? "!" : reached ? "✓" : String(index + 1).padStart(2, "0")}</span><div><strong>{item.title}</strong><small>{failed ? (simulationOutcome === "timeout" ? "Response not received; outcome is uncertain" : simulationOutcome === "reject" ? "Illustrative business rule rejection" : "Request matched an existing reference" ) : reached ? "Stage processed in this simulation" : "Not reached"}</small></div></div>; })}</div><div className={`rail-simulation-advice ${simulationOutcome === "success" ? "is-success" : "is-warning"}`}><strong>{simulationOutcome === "success" ? "Simulated outcome" : "Recommended next action"}</strong><p>{simulationOutcome === "success" ? "The illustrative flow reached its final stage. In a real integration, rely on the authoritative status returned by the payment scheme or participant." : simulationOutcome === "timeout" ? "Do not blindly resubmit. Query the original reference and reconcile its authoritative status before considering another instruction." : simulationOutcome === "reject" ? "Capture the reason code and correct the underlying issue before creating a new payment instruction." : "Check whether the original request already created a payment. Use a stable idempotency key or end-to-end reference to prevent duplicate execution."}</p></div></> : <p className="rail-flow-footnote">Enter an amount and reference, choose an outcome, then run the simulation to inspect a stage-by-stage result.</p>}</section></div>}
            {activeTab === "failures" && <div className="rail-failure-layout"><section className="paymentlab-card rail-scenario-card"><div className="paymentlab-card-title"><span className="paymentlab-title-icon">!</span><div><h3>Choose a failure scenario</h3><p>Illustrative examples for payment-system developers.</p></div></div><div className="rail-scenario-options">{scenarios.map((item) => <button key={item.id} className={scenarioId === item.id ? "is-selected" : ""} onClick={() => setScenarioId(item.id)}><strong>{item.label}</strong><span>{item.where}</span></button>)}</div></section><section className="paymentlab-card rail-scenario-detail"><span className="paymentlab-kicker">SCENARIO INSPECTOR · {rail.short}</span><h3>{scenario.label}</h3><div className="rail-scenario-status"><span>Illustrative status</span><strong>{scenario.status}</strong></div><div className="rail-scenario-status"><span>Likely point in flow</span><strong>{scenario.where}</strong></div><div className="rail-failure-note"><strong>Recommended handling</strong><p>{scenario.advice}</p></div><div className="rail-detail-block"><h4>Developer checklist</h4><ul><li>Log the payment reference and correlation ID.</li><li>Preserve the original request and response where permitted.</li><li>Check authoritative payment status before retrying.</li><li>Expose a clear, non-technical status to the customer.</li></ul></div></section></div>}
          </section>
          <div className="paymentlab-disclaimer"><span>ⓘ</span><p><strong>Educational explorer.</strong> The flows and scenarios are simplified illustrations, not production routing instructions or complete scheme specifications. For implementation, consult current official scheme and network documentation. No bank connection or real payment is used.</p></div>
        </main>
        <footer className="home-footer"><span>© 2026 FintechSchema. All rights reserved.</span><span>Payment Lab · Module 02 · Payment Rail Explorer</span></footer>
      </div>
    </>
  );
}

export default PaymentRailExplorerPage;
