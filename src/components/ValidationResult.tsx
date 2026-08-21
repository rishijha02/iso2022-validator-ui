import type { ValidationResponse } from "../types/validation";

interface ValidationResultProps {
  result: ValidationResponse | null;
}

function CheckIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M8 12.5l2.5 2.5L16 9.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M12 7.5v5.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle cx="12" cy="16.3" r="1" fill="currentColor" />
    </svg>
  );
}

function ValidationResult({ result }: ValidationResultProps) {
  if (!result) {
    return null;
  }

  const errors = result.errors ?? [];
  const hasErrors = errors.length > 0;

  return (
    <div className="result-card">
      <div
        className={`result-header ${
          result.valid ? "result-header--valid" : "result-header--invalid"
        }`}
      >
        <div
          className={`status-pill ${
            result.valid ? "status-pill--valid" : "status-pill--invalid"
          }`}
        >
          {result.valid ? <CheckIcon /> : <AlertIcon />}
          <span>{result.valid ? "Valid message" : "Validation failed"}</span>
        </div>

        {result.message && <p className="result-message">{result.message}</p>}
      </div>

      <div className="result-summary">
        <div className="summary-item">
          <span className="summary-label">Message type</span>
          <span className="summary-value">{result.messageTyp || "—"}</span>
        </div>

        <div className="summary-item">
          <span className="summary-label">Version</span>
          <span className="summary-value">{result.version || "—"}</span>
        </div>

        <div className="summary-item summary-item--wide">
          <span className="summary-label">Namespace</span>
          <span className="summary-value summary-value--mono">
            {result.namespace || "—"}
          </span>
        </div>
      </div>

      {hasErrors ? (
        <div className="error-list">
          <div className="error-list-header">
            <span>Line</span>
            <span>Column</span>
            <span>Code</span>
            <span>Message</span>
          </div>

          {errors.map((error, index) => (
            <div className="error-item" key={`${error.code}-${index}`}>
              <span className="error-location">{error.line}</span>
              <span className="error-location">{error.column}</span>
              <span className="error-code">{error.code}</span>
              <span className="error-message">{error.message}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-errors">No schema issues found in this message.</div>
      )}
    </div>
  );
}

export default ValidationResult;
