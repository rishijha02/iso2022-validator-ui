import { useState } from "react";
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


function SupportedMessagesPage() {

  const navigate = useNavigate();

  const [selectedFamily, setSelectedFamily] =
    useState<MessageFamily | null>(null);

  const [selectedMessage, setSelectedMessage] =
    useState<string | null>(null);


  /*
   * This guarantees that versions is always an array.
   * Therefore .map() will not throw an error.
   */
  const versions: string[] =
    selectedFamily && selectedMessage
      ? messageData[selectedFamily]
          .messages[selectedMessage] ?? []
      : [];


  const handleFamilyClick = (
    family: MessageFamily
  ) => {

    setSelectedFamily(family);

    // Reset selected message when changing family
    setSelectedMessage(null);
  };


  const handleBack = () => {

    // If user is viewing versions
    if (selectedMessage) {

      setSelectedMessage(null);

    }

    // If user is viewing messages
    else if (selectedFamily) {

      setSelectedFamily(null);

    }

    // If user is on the main supported messages screen
    else {

      navigate("/");
    }

  };


  return (

    <div className="supported-page">

      <div className="supported-container">


        {/* BACK BUTTON */}

        <button
          className="back-button"
          onClick={handleBack}
        >
          ← Back
        </button>


        {/* ================================= */}
        {/* LEVEL 1 - MESSAGE FAMILIES */}
        {/* ================================= */}

        {!selectedFamily && (

          <>

            <h1>
              Supported Messages
            </h1>

            <p>
              Browse ISO 20022 message families,
              message types and available versions.
            </p>


            <div className="family-grid">


              {/* PACS */}

              <button
                className="family-card"
                onClick={() =>
                  handleFamilyClick("pacs")
                }
              >

                <h2>
                  pacs
                </h2>

                <p>
                  Payments Clearing and Settlement
                </p>

                <span>
                  View Messages →
                </span>

              </button>


              {/* PAIN */}

              <button
                className="family-card"
                onClick={() =>
                  handleFamilyClick("pain")
                }
              >

                <h2>
                  pain
                </h2>

                <p>
                  Payment Initiation
                </p>

                <span>
                  View Messages →
                </span>

              </button>


              {/* CAMT */}

              <button
                className="family-card"
                onClick={() =>
                  handleFamilyClick("camt")
                }
              >

                <h2>
                  camt
                </h2>

                <p>
                  Cash Management
                </p>

                <span>
                  View Messages →
                </span>

              </button>


            </div>

          </>

        )}


        {/* ================================= */}
        {/* LEVEL 2 - MESSAGE TYPES */}
        {/* Example: pacs.002, pacs.008 */}
        {/* ================================= */}

        {selectedFamily && !selectedMessage && (

          <>

            <h1>
              {selectedFamily}
            </h1>

            <p>
              {messageData[selectedFamily].title}
            </p>


            <div className="message-grid">

              {Object.keys(
                messageData[selectedFamily].messages
              ).map((message) => (

                <button
                  key={message}
                  className="message-card"
                  onClick={() =>
                    setSelectedMessage(message)
                  }
                >

                  <h2>
                    {message}
                  </h2>

                  <span>
                    View Versions →
                  </span>

                </button>

              ))}

            </div>

          </>

        )}


        {/* ================================= */}
        {/* LEVEL 3 - MESSAGE VERSIONS */}
        {/* Example: pacs.008.001.14 */}
        {/* ================================= */}

        {selectedFamily && selectedMessage && (

          <>

            <h1>
              {selectedMessage}
            </h1>

            <p>
              Available ISO 20022 versions
            </p>


            <div className="version-grid">

              {versions.map((version) => (

                <div
                  key={version}
                  className="version-card"
                >

                  <h3>
                    {version}
                  </h3>

                  <span className="supported-badge">
                    Supported
                  </span>

                </div>

              ))}

            </div>

          </>

        )}


      </div>

    </div>

  );

}


export default SupportedMessagesPage;