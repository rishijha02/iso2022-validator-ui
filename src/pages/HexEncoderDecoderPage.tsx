import { useState } from "react";
import SEO from "../components/SEO";
import { Link, useNavigate } from "react-router-dom";

type HexMode = "encode" | "decode";

function textToHex(text: string): string {

    const bytes = new TextEncoder().encode(text);

    return Array.from(bytes)
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join(" ");

}

function hexToText(hex: string): string {

    const cleaned = hex.replace(/\s+/g, "");

    if (cleaned.length === 0) {
        return "";
    }

    if (cleaned.length % 2 !== 0) {
        throw new Error(
            "Hex input must have an even number of characters."
        );
    }

    if (!/^[0-9a-fA-F]*$/.test(cleaned)) {
        throw new Error(
            "Invalid hex characters detected."
        );
    }

    const bytes = new Uint8Array(cleaned.length / 2);

    for (let i = 0; i < cleaned.length; i += 2) {
        bytes[i / 2] = parseInt(cleaned.substring(i, i + 2), 16);
    }

    return new TextDecoder().decode(bytes);

}

function HexEncoderDecoderPage() {

    const navigate = useNavigate();

    const [mode, setMode] = useState<HexMode>("encode");

    const [input, setInput] = useState("");
    const [output, setOutput] = useState("");
    const [error, setError] = useState("");


    const handleModeChange = (nextMode: HexMode) => {

        setMode(nextMode);
        setInput("");
        setOutput("");
        setError("");

    };


    const handleConvert = () => {

        if (!input.trim()) {

            setError(
                mode === "encode"
                    ? "Please enter some text."
                    : "Please enter a hex value."
            );

            return;

        }

        try {

            setError("");

            const result =
                mode === "encode"
                    ? textToHex(input)
                    : hexToText(input);

            setOutput(result);

        } catch (err) {

            console.error("Hex conversion failed:", err);

            setOutput("");

            setError(
                err instanceof Error
                    ? err.message
                    : "Unable to convert value."
            );

        }

    };


    const handleClear = () => {
        setInput("");
        setOutput("");
        setError("");
    };


    const handleCopy = async () => {

        if (!output) {
            return;
        }

        try {

            await navigator.clipboard.writeText(output);

            alert("Copied to clipboard.");

        } catch (err) {

            console.error("Copy failed:", err);

        }

    };


    return (
        <>
        <SEO
        title={'Hex Encoder & Decoder | FintechSchema'}
        description={'Convert text to hexadecimal and decode hexadecimal data with this free developer tool from FintechSchema.'}
        path={'/developer-tools/hex-encoder-decoder'}
      />

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

                    <Link to="/">
                        Home
                    </Link>

                    <Link
                        to="/developer-tools"
                        className="active-nav"
                    >
                        Developer Tools
                    </Link>

                    <Link to="/supported-messages">
                        Supported Messages
                    </Link>

                    <Link to="/about">
                        About
                    </Link>

                </nav>

            </header>


            <main className="developer-tool-page">

                <div className="developer-tool-card">

                    <div className="developer-tool-header">

                        <div>

                            <h2>
                                Hexadecimal Encoder / Decoder
                            </h2>

                            <p>
                                Convert text into hexadecimal, or
                                decode hex values back into text.
                            </p>

                        </div>

                        <span className="developer-tool-badge">
                            HEX
                        </span>

                    </div>


                    {/* Mode toggle */}

                    <div className="uuid-options">

                        <label htmlFor="hexMode">
                            Mode
                        </label>

                        <select
                            id="hexMode"
                            className="uuid-count-select"
                            value={mode}
                            onChange={(e) =>
                                handleModeChange(
                                    e.target.value as HexMode
                                )
                            }
                        >
                            <option value="encode">
                                Text → Hex
                            </option>

                            <option value="decode">
                                Hex → Text
                            </option>
                        </select>

                    </div>


                    {/* Input */}

                    <label
                        className="developer-tool-label"
                        htmlFor="hexInput"
                    >
                        {mode === "encode"
                            ? "Text Input"
                            : "Hex Input"}
                    </label>

                    <textarea
                        id="hexInput"
                        className="developer-tool-textarea"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={
                            mode === "encode"
                                ? "Type or paste text here..."
                                : "Paste hex here, e.g. 48 65 6c 6c 6f"
                        }
                    />


                    <div className="developer-tool-actions">

                        <button
                            className="summary-button"
                            onClick={handleConvert}
                        >
                            Convert →
                        </button>

                        <button
                            className="tool-clear-button"
                            onClick={handleClear}
                        >
                            Clear
                        </button>

                    </div>


                    {error && (

                        <div className="developer-tool-error">
                            {error}
                        </div>

                    )}


                    {/* Output */}

                    <label
                        className="developer-tool-label"
                        htmlFor="hexOutput"
                    >
                        {mode === "encode"
                            ? "Hex Output"
                            : "Text Output"}
                    </label>

                    <textarea
                        id="hexOutput"
                        className="developer-tool-textarea"
                        value={output}
                        readOnly
                        placeholder="Converted value will appear here..."
                    />

                    <div className="developer-tool-output-actions">

                        <button
                            className="tool-copy-button"
                            onClick={handleCopy}
                            disabled={!output}
                        >
                            Copy
                        </button>

                    </div>

                </div>


                {/* Information */}

                <div className="developer-tool-info">

                    <div>

                        <h3>
                            What is Hex Encoding?
                        </h3>

                        <p>
                            Hexadecimal encoding represents each
                            byte of data as two hex characters
                            (0-9, A-F). It's commonly used to
                            display binary data, such as UETRs,
                            checksums, or raw message bytes, in a
                            readable text format.
                        </p>

                    </div>

                    <div>

                        <h3>
                            Common Uses
                        </h3>

                        <p>
                            Useful for inspecting raw bytes in
                            payment messages, debugging encoding
                            issues, or converting between text and
                            hex when working with lower-level
                            message formats.
                        </p>

                    </div>

                </div>

            </main>

        </div>

    </>

    );

}

export default HexEncoderDecoderPage;
