import SEO from "../components/SEO";
import { useNavigate } from "react-router-dom";

function AboutPage() {

  const navigate = useNavigate();

  return (
      <>
      <SEO
        title={'About FintechSchema | Financial Messaging & Payment Developer Tools'}
        description={'Learn about FintechSchema and the people building tools for ISO 20022 messaging, payment flows, open banking concepts and fintech developers.'}
        path={'/about'}
      />

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
              FintechSchema
            </div>

            <div className="logo-subtitle">
              Fintech Developer Tools
            </div>

          </div>

        </div>

      </header>


      <main className="about-page">

        <section className="about-hero">

          <h1>
            About FintechSchema
          </h1>

          <p>
            A developer-focused platform that brings financial messaging tools, payment-flow learning experiences and practical fintech utilities together in one place.
          </p>

        </section>


        {/* TEAM SECTION */}

        <section className="team-section">

          <h2>Our Team</h2>

          <p>
            The people behind FintechSchema, working to make financial messaging and payment concepts easier to explore, understand and troubleshoot.
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
            What is FintechSchema?
          </h2>

          <p>
            FintechSchema is a developer-focused platform for working with supported
            ISO 20022 messages, exploring payment flows, and using practical utilities
            for common fintech development tasks.
          </p>

          <p>
            The platform includes message validation and generation, business-friendly message summaries, developer utilities, an Open Banking Lab, and a Payments Lab with a Payment Simulator and Payment Rail Explorer. Exact support depends on the tool and configured message profile.
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
            Why FintechSchema?
          </h2>

          <p>
            ISO 20022 messages can be complex and difficult
            to troubleshoot manually. A small XML or data
            issue can cause a message to fail schema validation.
          </p>

          <p>
            FintechSchema aims to make complex financial messaging and payment workflows more approachable through practical tools and educational simulations. The labs are for learning and do not initiate real payments.
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

  </>

  );

}

export default AboutPage;