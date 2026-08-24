import { useNavigate } from "react-router-dom";

function AboutPage() {

  const navigate = useNavigate();

  return (

    <div className="app">

      <header className="header">

        <div
          className="logo"
          onClick={() => navigate("/")}
          style={{ cursor: "pointer" }}
        >

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

      </header>


      <main className="about-page">

        <section className="about-hero">

          <h1>
            About ISO 20022 Validator
          </h1>

          <p>
            A simple tool designed to help developers,
            fintech teams, and banking professionals validate
            and understand ISO 20022 messages.
          </p>

        </section>


        {/* TEAM SECTION */}

        <section className="team-section">

          <h2>Our Team</h2>

          <p>
            The people building tools to make ISO 20022 messages
            easier to validate, understand, and troubleshoot.
          </p>


          <div className="team-container">


            {/* Rishi */}

            <div className="team-card">

              <div className="team-avatar">
                RJ
              </div>

              <h3>Rishi Jha</h3>

              <p className="team-role">
                Founder & Developer
              </p>

              <p className="team-description">
                Building fintech solutions with a focus on banking,
                payments, ISO 20022, and financial technology.
              </p>

              <a
                href="https://www.linkedin.com/in/rishi-jha-168719172/"
                target="_blank"
                rel="noopener noreferrer"
                className="linkedin-button"
              >
                LinkedIn →
              </a>

            </div>


            {/* Vikash */}

            <div className="team-card">

              <div className="team-avatar">
                VK
              </div>

              <h3>Vikash Kumar</h3>

              <p className="team-role">
                Mentor & Business Analyst
              </p>

              <p className="team-description">
                Supporting the project with business analysis,
                domain knowledge, and guidance around banking
                and financial services.
              </p>

              <a
                href="https://www.linkedin.com/in/vikash-kumar-52245857/"
                target="_blank"
                rel="noopener noreferrer"
                className="linkedin-button"
              >
                LinkedIn →
              </a>

            </div>


            {/* Ashish */}

            <div className="team-card">

              <div className="team-avatar">
                APS
              </div>

              <h3>Ashish Pratap Singh</h3>

              <p className="team-role">
                Developer & Business Analyst
              </p>

              <p className="team-description">
                Contributing to the project through development,
                business analysis, and expertise in financial
                technology solutions.
              </p>

              <a
                href="https://www.linkedin.com/in/ashish-pratap-singh/"
                target="_blank"
                rel="noopener noreferrer"
                className="linkedin-button"
              >
                LinkedIn →
              </a>

            </div>

          </div>

        </section>


        <section className="about-card">

          <h2>
            What is this project?
          </h2>

          <p>
            ISO 20022 Validator allows users to paste an
            ISO 20022 XML message and validate it against
            the corresponding XML Schema Definition (XSD).
          </p>

          <p>
            The application automatically detects the
            ISO 20022 message type and version from the
            XML namespace and uses the appropriate schema
            for validation.
          </p>

        </section>


        <section className="about-grid">

          <div className="about-card">

            <h2>
              🔍 XML Validation
            </h2>

            <p>
              Validate the XML structure and field values
              against the corresponding ISO 20022 XSD.
            </p>

          </div>


          <div className="about-card">

            <h2>
              ⚠️ Detailed Errors
            </h2>

            <p>
              View validation errors with error codes,
              line numbers, column numbers, and detailed
              messages.
            </p>

          </div>


          <div className="about-card">

            <h2>
              📄 XML Formatter
            </h2>

            <p>
              Format XML messages to make complex
              ISO 20022 structures easier to read.
            </p>

          </div>


          <div className="about-card">

            <h2>
              📊 Message Summary
            </h2>

            <p>
              Convert complex ISO 20022 XML messages into
              a business-friendly summary showing important
              information such as parties, transactions,
              amounts, and message details.
            </p>

          </div>

        </section>


        <section className="about-card">

          <h2>
            Supported Message Families
          </h2>

          <div className="message-tags">

            <span>pacs</span>
            <span>pain</span>
            <span>camt</span>
            <span>head</span>

          </div>

          <p>
            Support for additional ISO 20022 message types
            and versions can be added progressively.
          </p>

        </section>


        <section className="about-card">

          <h2>
            Why this project?
          </h2>

          <p>
            ISO 20022 messages can be complex and difficult
            to troubleshoot manually. A small XML or data
            issue can cause a message to fail schema validation.
          </p>

          <p>
            This project aims to provide developers and
            banking professionals with a simple interface
            to validate messages, identify errors, and
            understand the business information contained
            inside an ISO 20022 message.
          </p>

        </section>


        <div className="about-back">

          <button
            className="summary-button"
            onClick={() => navigate("/")}
          >
            ← Back to Validator
          </button>

        </div>

      </main>

    </div>

  );

}

export default AboutPage;