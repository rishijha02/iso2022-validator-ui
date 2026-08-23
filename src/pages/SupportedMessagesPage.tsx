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

/**
 * Builds a minimal starter XML for a given ISO 20022 version — correct
 * root element and namespace, with a comment marking it as a skeleton.
 * This is NOT a fully populated, schema-valid message (the actual body
 * differs per message type and would need the real XSD to generate
 * accurately) — it's a starting point to test against the validator.
 */
function buildSampleXml(messageType: string, version: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:${version}">
  <!--
    Starter skeleton for ${messageType} (${version}).
    This is not a complete, schema-valid message — replace this
    comment with the actual message body for your use case.
  -->
</Document>
`;
}

function downloadSample(messageType: string, version: string) {
  const xml = buildSampleXml(messageType, version);
  const blob = new Blob([xml], { type: "application/xml" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `${version}-sample.xml`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

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
          Each version includes a downloadable starter XML.
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
                              downloadSample(messageType, version)
                            }
                            title={`Download a starter XML for ${version}`}
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
                              <path d="M12 3v12" />
                              <path d="M7 10l5 5 5-5" />
                              <path d="M5 21h14" />
                            </svg>
                            Download sample
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
