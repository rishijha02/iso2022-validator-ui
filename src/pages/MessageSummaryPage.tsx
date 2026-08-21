import {
  useLocation,
  useNavigate
} from "react-router-dom";

import {
  useEffect,
  useState
} from "react";

import {
  generateMessageSummary
} from "../services/messageSummaryService";

import type {
  MessageSummaryResponse
} from "../services/messageSummaryService";


function MessageSummaryPage() {

  const location = useLocation();

  const navigate = useNavigate();

  const xml = location.state?.xml;


  const [summaryResult, setSummaryResult] =
    useState<MessageSummaryResponse | null>(
      null
    );

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);


  useEffect(() => {

    const loadSummary = async () => {

      if (!xml) {
        return;
      }

      setLoading(true);

      setError(null);

      try {

        const response =
          await generateMessageSummary(xml);

        console.log(
          "Message Summary:",
          response
        );

        setSummaryResult(response);

      } catch (err) {

        console.error(
          "Unable to generate summary:",
          err
        );

        setError(
          "Unable to generate message summary."
        );

      } finally {

        setLoading(false);

      }

    };

    loadSummary();

  }, [xml]);


  return (

    <div className="summary-page">

      <div className="summary-container">


        {/* HEADER */}

        <div className="summary-header">

          <div>

            <h1>
              Message Summary
            </h1>

            <p>
              Business-friendly view of your
              ISO 20022 message
            </p>

          </div>


          <button
            className="back-button"
            onClick={() => navigate("/")}
          >
            ← Back to Validator
          </button>

        </div>


        {/* NO XML */}

        {!xml && (

          <div className="summary-empty">

            <h2>
              No XML Message Found
            </h2>

            <p>
              Please validate an ISO 20022
              message first.
            </p>

            <button
              onClick={() => navigate("/")}
            >
              Go to Validator
            </button>

          </div>

        )}


        {/* LOADING */}

        {xml && loading && (

          <div className="summary-loading">

            <h2>
              Generating Message Summary...
            </h2>

            <p>
              Analyzing your ISO 20022 message.
            </p>

          </div>

        )}


        {/* ERROR */}

        {xml && error && (

          <div className="summary-error">

            <h2>
              Unable to Generate Summary
            </h2>

            <p>
              {error}
            </p>

          </div>

        )}


        {/* SUCCESS */}

        {xml &&
          !loading &&
          !error &&
          summaryResult &&
          summaryResult.success && (

          <>

            {/* MESSAGE INFORMATION */}

            <div className="message-info-card">

              <div className="message-info-header">

                <div>

                  <span className="message-type">

                    {summaryResult.messageType}

                  </span>

                  <h2>

                    {summaryResult.title}

                  </h2>

                </div>


                <div className="version-badge">

                  Version {summaryResult.version}

                </div>

              </div>

            </div>


            {/* SUMMARY */}

            <div className="summary-card">

              <h2>
                Message Details
              </h2>


              <div className="summary-grid">

                {Object.entries(
                  summaryResult.summary
                ).map(([key, value]) => (

                  <div
                    key={key}
                    className="summary-item"
                  >

                    <span className="summary-label">

                      {key}

                    </span>


                    <span className="summary-value">

                      {value}

                    </span>

                  </div>

                ))}

              </div>

            </div>


            {/* RAW XML OPTION */}

            <div className="summary-footer">

              <button
                className="secondary-button"
                onClick={() => navigate("/")}
              >

                ← Back to Validator

              </button>

            </div>

          </>

        )}


        {/* BACKEND ERROR */}

        {summaryResult &&
          !summaryResult.success && (

          <div className="summary-error">

            <h2>
              Summary Generation Failed
            </h2>

            <p>

              {summaryResult.errorMessage
                || "Unable to analyze this message."}

            </p>

          </div>

        )}


      </div>

    </div>

  );

}


export default MessageSummaryPage;