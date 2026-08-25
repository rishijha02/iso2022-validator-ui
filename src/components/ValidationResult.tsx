import type {
  ValidationResponse,
  ValidationError,
} from "../types/validation";

interface ValidationResultProps {
  result: ValidationResponse;
}

function ValidationResult({
  result,
}: ValidationResultProps) {

  const errors: ValidationError[] =
    result.errors ?? [];

  return (

    <section
      className={
        result.valid
          ? "validation-result success"
          : "validation-result failure"
      }
    >

      {/* Result Header */}

      <div className="validation-result-header">

        <div className="validation-status">

          <span className="validation-icon">

            {result.valid ? "✓" : "!"}

          </span>

          <div>

            <h2>

              {result.valid
                ? "Validation successful"
                : "Validation failed"}

            </h2>

            <p>
              {result.message}
            </p>

          </div>

        </div>

      </div>


      {/* Message Information */}

      <div className="validation-meta">

        <div className="meta-card">

          <span>
            MESSAGE TYPE
          </span>

          <strong>
            {result.messageType ??
              result.messageTyp ??
              "-"}
          </strong>

        </div>


        <div className="meta-card">

          <span>
            VERSION
          </span>

          <strong>
            {result.version ?? "-"}
          </strong>

        </div>


        {result.namespace && (

          <div className="meta-card namespace-card">

            <span>
              NAMESPACE
            </span>

            <strong>
              {result.namespace}
            </strong>

          </div>

        )}

      </div>


      {/* Validation Errors */}

      {!result.valid &&
        errors.length > 0 && (

          <div className="validation-errors">

            <h3>
              Issues Found
            </h3>


            {errors.map(
              (error, index) => (

                <div
                  className="friendly-error-card"
                  key={index}
                >

                  {/* Error Location */}

                  <div className="error-location">

                    <span>

                      📍 Line{" "}

                      <strong>
                        {error.line ?? "-"}
                      </strong>

                    </span>


                    <span>

                      Column{" "}

                      <strong>
                        {error.column ?? "-"}
                      </strong>

                    </span>

                  </div>


                  {/* Friendly Error */}

                  <div className="friendly-error-message">

                    <h4>

                      ❌ {error.message}

                    </h4>


                    {error.suggestion && (

                      <div className="error-suggestion">

                        <span>
                          How to fix
                        </span>

                        <p>
                          {error.suggestion}
                        </p>

                      </div>

                    )}

                  </div>


                  {/* Technical Details */}

                  {error.technicalMessage && (

                    <details
                      className="technical-details"
                    >

                      <summary>
                        Technical details
                      </summary>

                      <pre>
                        {error.technicalMessage}
                      </pre>

                    </details>

                  )}

                </div>

              )
            )}

        </div>

      )}

    </section>

  );

}

export default ValidationResult;