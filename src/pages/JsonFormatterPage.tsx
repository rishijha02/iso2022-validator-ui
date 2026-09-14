import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import SEO from "../components/SEO";

type Status =
    | { type: "idle"; message: string }
    | { type: "valid"; message: string }
    | { type: "invalid"; message: string };

function getParseMessage(error: unknown): string {
    const message = error instanceof Error ? error.message : "Unable to parse JSON.";
    const position = message.match(/position\s+(\d+)/i)?.[1];

    return position
        ? `Invalid JSON near character ${position}: ${message}`
        : `Invalid JSON: ${message}`;
}

function JsonFormatterPage() {
    const navigate = useNavigate();
    const [input, setInput] = useState("");
    const [output, setOutput] = useState("");
    const [status, setStatus] = useState<Status>({
        type: "idle",
        message: "Paste a JSON payload to format, minify, or validate it.",
    });
    const [copied, setCopied] = useState(false);

    const parseInput = (): { valid: true; value: unknown } | null => {
        if (!input.trim()) {
            setOutput("");
            setStatus({ type: "invalid", message: "Enter a JSON payload before running this action." });
            return null;
        }

        try {
            const parsed = JSON.parse(input);
            setStatus({ type: "valid", message: "Valid JSON. Your payload is ready to use." });
            return { valid: true, value: parsed };
        } catch (error) {
            setOutput("");
            setStatus({ type: "invalid", message: getParseMessage(error) });
            return null;
        }
    };

    const formatJson = () => {
        const result = parseInput();
        if (result) {
            const formatted = JSON.stringify(result.value, null, 2);
            setOutput(formatted);
        }
    };

    const minifyJson = () => {
        const result = parseInput();
        if (result) {
            const minified = JSON.stringify(result.value);
            setOutput(minified);
        }
    };

    const validateJson = () => {
        const result = parseInput();
        if (result) {
            setOutput(JSON.stringify(result.value, null, 2));
        }
    };

    const copyOutput = async () => {
        if (!output) return;

        try {
            await navigator.clipboard.writeText(output);
            setCopied(true);
        } catch (error) {
            console.error("Copy failed:", error);
            setStatus({ type: "invalid", message: "Could not access the clipboard. Select and copy the output manually." });
        }
    };

    const clearAll = () => {
        setInput("");
        setOutput("");
        setCopied(false);
        setStatus({ type: "idle", message: "Paste a JSON payload to format, minify, or validate it." });
    };

    return (
        <div className="app">
            <SEO
                title="JSON Formatter & Validator | FintechSchema"
                description="Format, minify, validate and copy JSON payloads online for fintech APIs, payment messages and developer workflows."
                path="/developer-tools/json-formatter"
            />

            <header className="home-header">
                <Link to="/" className="home-brand">
                    <span className="home-brand-icon">ISO</span>
                    <span>
                        <strong>ISO 20022 Validator</strong>
                        <small>Fintech Developer Platform</small>
                    </span>
                </Link>

                <nav className="home-nav">
                    <Link to="/">Home</Link>
                    <Link to="/message-generator">Message Generator</Link>
                    <Link to="/developer-tools">Developer Tools</Link>
                    <Link to="/documentation">Documentation</Link>
                    <Link to="/about">About</Link>
                    <div className="home-auth-actions">
                        <Link to="/login" className="home-login-link">Login</Link>
                        <Link to="/signup" className="home-signup-button">Sign up</Link>
                    </div>
                </nav>
            </header>

            <main className="developer-tool-page">
                <section className="tools-hero">
                    <h1>JSON Formatter / Validator</h1>
                    <p>Prepare clean JSON payloads for fintech APIs, payment workflows, and integration testing.</p>
                </section>

                <section className="developer-tool-card">
                    <div className="developer-tool-header">
                        <div>
                            <h2>JSON Workspace</h2>
                            <p>Format readable JSON, create compact payloads, and catch syntax errors before sending a request.</p>
                        </div>
                        <span className="developer-tool-badge">JSON</span>
                    </div>

                    <label className="developer-tool-label" htmlFor="jsonInput">JSON input</label>
                    <textarea
                        id="jsonInput"
                        className="developer-tool-textarea json-tool-textarea"
                        value={input}
                        onChange={(event) => {
                            setInput(event.target.value);
                            setCopied(false);
                            setStatus({ type: "idle", message: "Ready to validate your JSON." });
                        }}
                        placeholder={'Paste JSON here, e.g. {"payment":{"amount":100,"currency":"EUR"}}'}
                        spellCheck={false}
                    />

                    <div className="developer-tool-actions">
                        <button className="summary-button" onClick={formatJson}>Format / Beautify</button>
                        <button className="summary-button secondary-button" onClick={minifyJson}>Minify</button>
                        <button className="tool-validate-button" onClick={validateJson}>Validate</button>
                        <button className="tool-clear-button" onClick={clearAll}>Clear</button>
                    </div>

                    <div className={`json-status json-status-${status.type}`} role="status" aria-live="polite">
                        <span aria-hidden="true">{status.type === "valid" ? "✓" : status.type === "invalid" ? "!" : "i"}</span>
                        {status.message}
                    </div>

                    <label className="developer-tool-label json-output-label" htmlFor="jsonOutput">Output</label>
                    <textarea
                        id="jsonOutput"
                        className="developer-tool-textarea json-tool-textarea"
                        value={output}
                        readOnly
                        placeholder="Formatted JSON will appear here..."
                        spellCheck={false}
                    />

                    <div className="developer-tool-output-actions">
                        <button className="tool-copy-button" onClick={copyOutput} disabled={!output}>
                            {copied ? "Copied" : "Copy"}
                        </button>
                    </div>
                </section>

                <section className="developer-tool-info">
                    <div>
                        <h3>Built for API payloads</h3>
                        <p>Use a readable payload while developing, then minify it when you need a compact JSON request or message fixture.</p>
                    </div>
                    <div>
                        <h3>Useful validation feedback</h3>
                        <p>The validator highlights malformed JSON and, when available, points to the character position that needs attention.</p>
                    </div>
                </section>

                <div className="tools-back">
                    <button className="summary-button" onClick={() => navigate("/developer-tools")}>← Back to Developer Tools</button>
                </div>
            </main>
        </div>
    );
}

export default JsonFormatterPage;
