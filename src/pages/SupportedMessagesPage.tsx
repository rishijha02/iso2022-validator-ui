import { useNavigate } from "react-router-dom";

type MessageFamily = "pacs" | "pain" | "camt";

type MessageData = {
  title: string;
  messages: Record<string, string[]>;
};

const messageData: Record<MessageFamily, MessageData> = {
  pacs: {
    title: "Payments Clearing and Settlement",

    messages: {
      "pacs.002": [
        "pacs.002.001.09",
        "pacs.002.001.10",
        "pacs.002.001.11"
      ],

      "pacs.008": [
        "pacs.008.001.09",
        "pacs.008.001.10",
        "pacs.008.001.11",
        "pacs.008.001.12",
        "pacs.008.001.13",
        "pacs.008.001.14"
      ]
    }
  },

  pain: {
    title: "Payment Initiation",

    messages: {
      "pain.001": [
        "pain.001.001.09",
        "pain.001.001.10",
        "pain.001.001.11",
        "pain.001.001.12"
      ],

      "pain.008": [
        "pain.008.001.10",
        "pain.008.001.11",
        "pain.008.001.12"
      ]
    }
  },

  camt: {
    title: "Cash Management",

    messages: {
      "camt.052": [
        "camt.052.001.08",
        "camt.052.001.09",
        "camt.052.001.10"
      ],

      "camt.053": [
        "camt.053.001.08",
        "camt.053.001.09",
        "camt.053.001.10"
      ],

      "camt.054": [
        "camt.054.001.08",
        "camt.054.001.09",
        "camt.054.001.10"
      ]
    }
  }
};

const familyOrder: MessageFamily[] = ["pacs", "pain", "camt"];

function SupportedMessagesPage() {

  const navigate = useNavigate();

  return (

    <div className="supported-page">

      <div className="supported-container">

        {/* BACK BUTTON */}

        <button
          className="back-button"
          onClick={() => navigate("/")}
        >
          ← Back
        </button>

        <h1>
          Supported Messages
        </h1>

        <p>
          Browse ISO 20022 message families,
          message types and available versions.
          Each version can be opened directly in the message generator, where you can generate a default message or enter custom inputs.
        </p>


        {/* Everything below is rendered up front —
            no clicks needed to see message types or versions. */}

        {familyOrder.map((family) => (

          <section
            key={family}
            className="family-section"
          >

            <div className="family-section-header">
              <h2>{family}</h2>
              <p>{messageData[family].title}</p>
            </div>

            <div className="message-block-grid">

              {Object.entries(messageData[family].messages).map(
                ([messageType, versions]) => (

                  <div
                    key={messageType}
                    className="message-block"
                  >

                    <h3>{messageType}</h3>

                    <div className="version-chip-list">

                      {versions.map((version) => (

                        <div
                          key={version}
                          className="version-chip-row"
                        >

                          <span className="version-chip">
                            {version}
                          </span>

                          <button
                            type="button"
                            className="version-download-link"
                            onClick={() =>
                              navigate("/message-generator", {
                                state: {
                                  messageType,
                                  version: version.replace(`${messageType}.`, "")
                                }
                              })
                            }
                            title={`Open generator for ${version}`}
                          >
                            <svg
                              width="13"
                              height="13"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M5 12h14" />
                              <path d="M13 6l6 6-6 6" />
                            </svg>
                            Generate message
                          </button>

                        </div>

                      ))}

                    </div>

                  </div>

                )
              )}

            </div>

          </section>

        ))}

      </div>

    </div>

  );

}

export default SupportedMessagesPage;
