import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Base64ToolPage() {

    const navigate = useNavigate();

    const [input, setInput] = useState("");
    const [output, setOutput] = useState("");
    const [error, setError] = useState("");

    const encodeBase64 = () => {

        if (!input.trim()) {
            setError("Please enter some text to encode.");
            setOutput("");
            return;
        }

        try {

            const encoded = btoa(
                unescape(
                    encodeURIComponent(input)
                )
            );

            setOutput(encoded);
            setError("");

        } catch (err) {

            console.error(err);
            setError("Unable to encode the input.");
            setOutput("");

        }

    };


    const decodeBase64 = () => {

        if (!input.trim()) {
            setError("Please enter Base64 text to decode.");
            setOutput("");
            return;
        }

        try {

            const decoded = decodeURIComponent(
                escape(
                    atob(input.trim())
                )
            );

            setOutput(decoded);
            setError("");

        } catch (err) {

            console.error(err);
            setError(
                "Invalid Base64 input. Please check the value and try again."
            );

            setOutput("");

        }

    };


    const copyOutput = async () => {

        if (!output) {
            return;
        }

        try {

            await navigator.clipboard.writeText(output);

        } catch (err) {

            console.error(
                "Unable to copy:",
                err
            );

        }

    };


    const clearAll = () => {

        setInput("");
        setOutput("");
        setError("");

    };


    return (

        <div className="app">

            {/* Header */}

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


                <nav>

                    <Link to="/documentation">
                        Documentation
                    </Link>

                    <Link to="/supported-messages">
                        Supported Messages
                    </Link>

                    <Link
                        to="/developer-tools"
                        className="active-nav"
                    >
                        Developer Tools
                    </Link>

                    <Link to="/about">
                        About
                    </Link>

                </nav>

            </header>


            <main className="developer-tool-page">

                {/* Hero */}

                <section className="tools-hero">

                    <h1>
                        Base64 Encoder / Decoder
                    </h1>

                    <p>
                        Encode text into Base64 or decode
                        Base64 data back into readable text.
                    </p>

                </section>


                {/* Tool */}

                <section className="developer-tool-card">

                    <div className="developer-tool-header">

                        <div>

                            <h2>
                                Base64 Converter
                            </h2>

                            <p>
                                Useful for working with encoded
                                API payloads, authentication data,
                                certificates, and payment systems.
                            </p>

                        </div>

                        <span className="developer-tool-badge">
                            BASE64
                        </span>

                    </div>


                    <label className="developer-tool-label">
                        Input
                    </label>

                    <textarea
                        className="developer-tool-textarea"
                        placeholder="Enter text or Base64 value..."
                        value={input}
                        onChange={(e) => {
                            setInput(e.target.value);
                            setError("");
                        }}
                    />


                    <div className="developer-tool-actions">

                        <button
                            className="summary-button"
                            onClick={encodeBase64}
                        >
                            Encode
                        </button>

                        <button
                            className="summary-button secondary-button"
                            onClick={decodeBase64}
                        >
                            Decode
                        </button>

                        <button
                            className="tool-clear-button"
                            onClick={clearAll}
                        >
                            Clear
                        </button>

                    </div>


                    {error && (

                        <div className="developer-tool-error">
                            {error}
                        </div>

                    )}


                    <label className="developer-tool-label">
                        Output
                    </label>

                    <textarea
                        className="developer-tool-textarea"
                        placeholder="Result will appear here..."
                        value={output}
                        readOnly
                    />


                    <div className="developer-tool-output-actions">

                        <button
                            className="tool-copy-button"
                            onClick={copyOutput}
                            disabled={!output}
                        >
                            Copy Output
                        </button>

                    </div>

                </section>


                {/* Information */}

                <section className="developer-tool-info">

                    <div>

                        <h3>
                            What is Base64?
                        </h3>

                        <p>
                            Base64 is an encoding method that
                            represents binary data using a set of
                            64 characters. It is commonly used when
                            binary data needs to be transmitted
                            through text-based systems.
                        </p>

                    </div>


                    <div>

                        <h3>
                            Common Uses
                        </h3>

                        <p>
                            Base64 is commonly encountered in APIs,
                            HTTP authentication, certificates,
                            encoded payloads, and financial
                            technology integrations.
                        </p>

                    </div>

                </section>


                <div className="tools-back">

                    <button
                        className="summary-button"
                        onClick={() => navigate("/developer-tools")}
                    >
                        ← Back to Developer Tools
                    </button>

                </div>

            </main>

        </div>

    );

}

export default Base64ToolPage;