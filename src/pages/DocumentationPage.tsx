import SEO from "../components/SEO";
import { Link } from "react-router-dom";

const toolCards = [
  {
    eyebrow: "CORE TOOL",
    title: "ISO 20022 Validator",
    description: "Validate XML messages against supported ISO 20022 schemas and configured SEPA or CBPR+ profiles. Review structural errors and troubleshoot message issues.",
    href: "/validator",
    link: "Open validator",
  },
  {
    eyebrow: "MESSAGE AUTHORING",
    title: "Message Generator",
    description: "Create sample ISO 20022 messages for supported message types and use them as a starting point for learning and testing.",
    href: "/message-generator",
    link: "Generate a message",
  },
  {
    eyebrow: "UNDERSTAND DATA",
    title: "Message Summary",
    description: "Turn supported ISO 20022 XML messages into a business-friendly view of important payment details, parties, identifiers and amounts.",
    href: "/summary",
    link: "Explore summaries",
  },
  {
    eyebrow: "DEVELOPER UTILITIES",
    title: "Developer Toolbox",
    description: "Use utilities for XML-to-JSON conversion, JSON formatting, identifier checks, Base64, hexadecimal encoding and UUID generation.",
    href: "/developer-tools",
    link: "Browse developer tools",
  },
  {
    eyebrow: "LEARNING LAB",
    title: "Open Banking Lab",
    description: "Explore the open banking concepts and example workflows available in the interactive lab. Check each lab's on-page notes for simulation limitations.",
    href: "/open-banking-lab",
    link: "Open Open Banking Lab",
  },
  {
    eyebrow: "PAYMENTS LAB · MODULE 1",
    title: "Payment Simulator",
    description: "Walk through a simulated payment lifecycle and learn how processing stages and outcomes can be represented.",
    href: "/payment-lab",
    link: "Open Payment Simulator",
  },
  {
    eyebrow: "PAYMENTS LAB · MODULE 2",
    title: "Payment Rail Explorer",
    description: "Explore the conceptual flows for SEPA Credit Transfer, SEPA Instant, SWIFT cross-border payments, UPI and Fedwire, with stage details and failure scenarios.",
    href: "/payment-rail-explorer",
    link: "Explore payment rails",
  },
];

function DocumentationPage() {
  return (
    <>
      <SEO
        title="FintechSchema Documentation | Financial Messaging & Payment Developer Tools"
        description="Learn how to use FintechSchema's ISO 20022 validation and generation tools, message summaries, developer utilities, Open Banking Lab and Payment Lab."
        path="/documentation"
      />

      <div className="app">
        <header className="header">
          <Link to="/" className="logo documentation-brand" aria-label="FintechSchema home">
            <div className="logo-icon">FS</div>
            <div>
              <div className="logo-title">FintechSchema</div>
              <div className="logo-subtitle">Fintech Developer Tools</div>
            </div>
          </Link>
          <nav aria-label="Main navigation">
            <Link to="/">Home</Link>
            <Link to="/documentation" aria-current="page">Documentation</Link>
            <Link to="/supported-messages">Supported Messages</Link>
            <Link to="/about">About</Link>
          </nav>
        </header>

        <main className="documentation-page documentation-hub">
          <div className="documentation-container">
            <section className="documentation-hero documentation-hub-hero">
              <span className="documentation-eyebrow">DEVELOPER DOCUMENTATION</span>
              <h1>Build your understanding of financial messaging.</h1>
              <p>
                A practical guide to FintechSchema's tools for ISO 20022 messages,
                payment flows, open banking concepts and everyday developer tasks.
              </p>
              <div className="documentation-hero-actions">
                <Link to="/validator" className="documentation-primary-link">Start with the validator <span aria-hidden="true">→</span></Link>
                <Link to="/supported-messages" className="documentation-secondary-link">View supported messages</Link>
              </div>
              <div className="documentation-hero-note">
                <span className="documentation-status-dot" />
                <span>Use sample data for exploration. Payment Lab flows are simulations, not live payment instructions.</span>
              </div>
            </section>

            <section className="documentation-section documentation-start-section" id="getting-started">
              <div className="documentation-section-heading">
                <span className="documentation-eyebrow">GETTING STARTED</span>
                <h2>Start with a simple workflow</h2>
                <p>Follow these steps to explore a message, understand its structure and investigate issues.</p>
              </div>
              <div className="documentation-steps documentation-step-grid">
                <article className="documentation-step">
                  <div className="step-number">01</div>
                  <div><h3>Choose a tool</h3><p>Open the validator, message generator, message summary or a developer utility based on your task.</p></div>
                </article>
                <article className="documentation-step">
                  <div className="step-number">02</div>
                  <div><h3>Use a sample or your XML</h3><p>Paste a message or generate an example. Select the relevant supported validation profile when applicable.</p></div>
                </article>
                <article className="documentation-step">
                  <div className="step-number">03</div>
                  <div><h3>Review and learn</h3><p>Inspect validation results, read the available message summary, or follow a payment flow in the labs.</p></div>
                </article>
              </div>
            </section>

            <section className="documentation-section" id="platform-tools">
              <div className="documentation-section-heading">
                <span className="documentation-eyebrow">PLATFORM GUIDE</span>
                <h2>Explore FintechSchema</h2>
                <p>Jump directly to a tool or lab. Availability and message coverage depend on the selected feature and supported configuration.</p>
              </div>
              <div className="documentation-feature-grid documentation-tool-grid">
                {toolCards.map((tool) => (
                  <article className="documentation-card documentation-tool-card" key={tool.title}>
                    <span className="documentation-card-eyebrow">{tool.eyebrow}</span>
                    <h3>{tool.title}</h3>
                    <p>{tool.description}</p>
                    <Link to={tool.href} className="documentation-card-link">{tool.link} <span aria-hidden="true">→</span></Link>
                  </article>
                ))}
              </div>
            </section>

            <section className="documentation-section" id="financial-messaging">
              <div className="documentation-section-heading">
                <span className="documentation-eyebrow">FINANCIAL MESSAGING</span>
                <h2>Understand the message, not just the XML</h2>
                <p>FintechSchema brings several common developer tasks into one place.</p>
              </div>
              <div className="documentation-feature-grid documentation-topic-grid">
                <article className="documentation-card">
                  <h3>ISO 20022 validation</h3>
                  <p>Check XML against supported schemas and configured profiles. Validation scope depends on the selected message and profile.</p>
                </article>
                <article className="documentation-card">
                  <h3>SEPA and CBPR+</h3>
                  <p>Use the relevant supported profile for SEPA or cross-border payment message work. Always confirm the applicable scheme and version requirements.</p>
                </article>
                <article className="documentation-card">
                  <h3>Message summaries</h3>
                  <p>Review key business details such as parties, transaction identifiers, amounts and currency when the selected message supports them.</p>
                </article>
                <article className="documentation-card">
                  <h3>Readable troubleshooting</h3>
                  <p>Use validation diagnostics to locate structural or schema-related issues, then inspect the relevant XML elements and values.</p>
                </article>
              </div>
              <div className="documentation-callout">
                <strong>Working with message types?</strong>
                <span>Check the current message list before assuming a particular message family, version or scheme profile is supported.</span>
                <Link to="/supported-messages">Browse supported messages →</Link>
              </div>
            </section>

            <section className="documentation-section" id="payment-lab">
              <div className="documentation-section-heading">
                <span className="documentation-eyebrow">PAYMENTS LAB</span>
                <h2>Explore payment lifecycles safely</h2>
                <p>Use the two Payment Lab modules to learn about payment processing and the differences between payment rails.</p>
              </div>
              <div className="documentation-feature-grid documentation-topic-grid">
                <article className="documentation-card">
                  <span className="documentation-card-eyebrow">MODULE 1</span>
                  <h3>Payment Simulator</h3>
                  <p>Explore a simulated payment journey and observe how different outcomes affect the displayed lifecycle.</p>
                  <Link to="/payment-lab" className="documentation-card-link">Open Module 1 →</Link>
                </article>
                <article className="documentation-card">
                  <span className="documentation-card-eyebrow">MODULE 2</span>
                  <h3>Payment Rail Explorer</h3>
                  <p>Compare conceptual rail flows, inspect stages, explore example ISO 20022 messages where applicable, and learn about failure scenarios.</p>
                  <Link to="/payment-rail-explorer" className="documentation-card-link">Open Module 2 →</Link>
                </article>
              </div>
              <div className="documentation-info-box documentation-simulation-note">
                <h3>Important: simulated examples</h3>
                <p>Payment Lab scenarios and message snippets are educational examples. They do not connect to banks, confirm settlement, or initiate real payments. Actual flows vary by scheme, participant and implementation.</p>
              </div>
            </section>

            <section className="documentation-section" id="developer-tools">
              <div className="documentation-section-heading">
                <span className="documentation-eyebrow">DEVELOPER UTILITIES</span>
                <h2>Small tools for everyday tasks</h2>
                <p>Format, convert and inspect data without leaving the platform.</p>
              </div>
              <div className="documentation-utility-list">
                <div><strong>XML to JSON</strong><span>Convert XML structures into a JSON representation.</span></div>
                <div><strong>JSON Formatter</strong><span>Format JSON to make nested data easier to read.</span></div>
                <div><strong>Identifier Validator</strong><span>Check identifiers supported by the utility.</span></div>
                <div><strong>Base64 and Hex tools</strong><span>Encode or decode data for development and troubleshooting.</span></div>
                <div><strong>UUID Generator</strong><span>Generate UUIDs for test data and development workflows.</span></div>
                <Link to="/developer-tools" className="documentation-primary-link">Open Developer Toolbox →</Link>
              </div>
            </section>

            <section className="documentation-footer documentation-hub-footer">
              <h2>Need a starting point?</h2>
              <p>Validate a sample message, browse the supported message list, or explore a simulated payment flow.</p>
              <div className="documentation-hero-actions documentation-footer-actions">
                <Link to="/validator" className="documentation-primary-link">Open validator →</Link>
                <Link to="/supported-messages" className="documentation-secondary-link">Supported messages</Link>
                <Link to="/about" className="documentation-secondary-link">About FintechSchema</Link>
              </div>
            </section>
          </div>
        </main>
      </div>
    </>
  );
}

export default DocumentationPage;
