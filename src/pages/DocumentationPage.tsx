import { Link, useNavigate } from "react-router-dom";

function DocumentationPage() {

  const navigate = useNavigate();

  return (

    <div className="app">

      {/* Header */}

      <header className="header">

        <div className="logo">

          <div className="logo-icon">
            ISO
          </div>

          <div>

            <div className="logo-title">
              ISO 20022 Validator
            </div>

            <div className="logo-subtitle">
              XML Schema Validation
            </div>

          </div>

        </div>


        <nav>

          <Link to="/">
            Home
          </Link>

          <Link to="/documentation">
            Documentation
          </Link>

          <Link to="/supported-messages">
            Supported Messages
          </Link>

          <Link to="/about">
            About
          </Link>

        </nav>

      </header>


      {/* Documentation Content */}

      <main className="documentation-page">

        <div className="documentation-container">


          {/* Page Header */}

          <section className="documentation-hero">

            <button
              className="back-button"
              onClick={() => navigate("/")}
            >
              ← Back to Validator
            </button>


            <h1>
              Documentation
            </h1>

            <p>
              Learn how to validate, analyze and work with
              ISO 20022 XML messages.
            </p>

          </section>


          {/* Getting Started */}

          <section className="documentation-section">

            <h2>
              Getting Started
            </h2>

            <p>
              ISO 20022 Validator allows you to validate XML
              messages against ISO 20022 schemas and other
              supported validation profiles.
            </p>


            <div className="documentation-steps">

              <div className="documentation-step">

                <div className="step-number">
                  1
                </div>

                <div>

                  <h3>
                    Enter XML
                  </h3>

                  <p>
                    Paste or write your XML message in the
                    XML editor.
                  </p>

                </div>

              </div>


              <div className="documentation-step">

                <div className="step-number">
                  2
                </div>

                <div>

                  <h3>
                    Select Validation Profile
                  </h3>

                  <p>
                    Choose ISO 20022, SEPA, CBPR+ or use
                    your own custom XSD.
                  </p>

                </div>

              </div>


              <div className="documentation-step">

                <div className="step-number">
                  3
                </div>

                <div>

                  <h3>
                    Validate Message
                  </h3>

                  <p>
                    Click Validate XML to check your message
                    against the corresponding schema.
                  </p>

                </div>

              </div>

            </div>

          </section>


          {/* XML Validation */}

          <section className="documentation-section">

            <h2>
              XML Validation
            </h2>

            <p>
              The validator identifies the XML message structure
              and validates it against the corresponding XML
              Schema Definition (XSD).
            </p>

            <div className="documentation-info-box">

              <h3>
                What is checked?
              </h3>

              <ul>

                <li>
                  XML structure
                </li>

                <li>
                  Required elements
                </li>

                <li>
                  Element hierarchy
                </li>

                <li>
                  Data types
                </li>

                <li>
                  ISO 20022 message namespace
                </li>

                <li>
                  Message version
                </li>

              </ul>

            </div>

          </section>


          {/* Validation Profiles */}

          <section className="documentation-section">

            <h2>
              Validation Profiles
            </h2>

            <p>
              Select the validation profile that matches the
              message standard you are working with.
            </p>


            <div className="documentation-feature-grid">


              <div className="documentation-card">

                <h3>
                  ISO 20022 Standard
                </h3>

                <p>
                  Validate ISO 20022 payment and cash management
                  messages using the supported ISO schemas.
                </p>

              </div>


              <div className="documentation-card">

                <h3>
                  SEPA Payments
                </h3>

                <p>
                  Validate payment messages according to
                  supported SEPA message schemas.
                </p>

              </div>


              <div className="documentation-card">

                <h3>
                  CBPR+
                </h3>

                <p>
                  Validate messages using the configured
                  CBPR+ / cross-border payment profile.
                </p>

              </div>


              <div className="documentation-card">

                <h3>
                  Custom XSD
                </h3>

                <p>
                  Upload your own XSD file and validate your
                  XML message against it.
                </p>

              </div>


            </div>

          </section>


          {/* Custom XSD */}

          <section className="documentation-section">

            <h2>
              Custom XSD Validation
            </h2>

            <p>
              If the required schema is not available in the
              built-in validation profiles, you can upload your
              own XSD file.
            </p>


            <div className="documentation-info-box">

              <h3>
                How it works
              </h3>

              <ol>

                <li>
                  Select <strong>Custom XSD</strong> from the
                  Validation Profile dropdown.
                </li>

                <li>
                  Upload an XSD file.
                </li>

                <li>
                  Enter or paste your XML message.
                </li>

                <li>
                  Click <strong>Validate XML</strong>.
                </li>

              </ol>

            </div>

          </section>


          {/* Message Summary */}

          <section className="documentation-section">

            <h2>
              Message Summary
            </h2>

            <p>
              After successfully validating an ISO 20022 message,
              you can view a business-friendly summary of the
              message.
            </p>

            <div className="documentation-info-box">

              <h3>
                Example information
              </h3>

              <ul>

                <li>
                  Message ID
                </li>

                <li>
                  Number of transactions
                </li>

                <li>
                  End-to-End ID
                </li>

                <li>
                  UETR
                </li>

                <li>
                  Amount and currency
                </li>

                <li>
                  Debtor and creditor
                </li>

                <li>
                  Settlement date
                </li>

                <li>
                  Charge bearer
                </li>

              </ul>

            </div>

          </section>


          {/* XML to JSON */}

          <section className="documentation-section">

            <h2>
              XML to JSON Converter
            </h2>

            <p>
              Convert your XML message into JSON format for easier
              reading, debugging and integration with modern APIs
              and applications.
            </p>

            <div className="documentation-info-box">

              <p>
                The converter transforms the XML structure into
                a JSON representation while preserving the
                hierarchy of the message.
              </p>

            </div>

          </section>


          {/* Supported Messages */}

          <section className="documentation-section">

            <h2>
              Supported Messages
            </h2>

            <p>
              Browse the currently supported ISO 20022 message
              families, message types and versions.
            </p>


            <div className="documentation-feature-grid">


              <div className="documentation-card">

                <h3>
                  pacs
                </h3>

                <p>
                  Payments Clearing and Settlement messages.
                </p>

              </div>


              <div className="documentation-card">

                <h3>
                  pain
                </h3>

                <p>
                  Payment Initiation messages.
                </p>

              </div>


              <div className="documentation-card">

                <h3>
                  camt
                </h3>

                <p>
                  Cash Management messages.
                </p>

              </div>


            </div>


            <div className="documentation-link-container">

              <Link
                to="/supported-messages"
                className="documentation-link"
              >
                Browse Supported Messages →
              </Link>

            </div>

          </section>


          {/* Future Feature */}

          <section className="documentation-section">

            <div className="coming-soon-section">

              <div className="coming-soon-badge">
                Coming Soon
              </div>


              <h2>
                Sample Message Generator
              </h2>


              <p>
                Generate sample ISO 20022 messages directly from
                the selected message type and version.
              </p>


              <div className="documentation-info-box">

                <h3>
                  Planned functionality
                </h3>

                <ul>

                  <li>
                    Select an ISO 20022 message family.
                  </li>

                  <li>
                    Select a message type.
                  </li>

                  <li>
                    Select a supported version.
                  </li>

                  <li>
                    Generate a sample XML message.
                  </li>

                  <li>
                    Edit and validate the generated message.
                  </li>

                </ul>

              </div>

            </div>

          </section>


          {/* Footer Action */}

          <section className="documentation-footer">

            <h2>
              Ready to validate your message?
            </h2>

            <p>
              Go back to the validator and start validating
              your ISO 20022 XML.
            </p>

            <button
              className="summary-button"
              onClick={() => navigate("/")}
            >
              Go to Validator →
            </button>

          </section>


        </div>

      </main>

    </div>

  );

}

export default DocumentationPage;