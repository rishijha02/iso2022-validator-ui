
import { useState } from "react";
import SEO from "../components/SEO";
import { useNavigate } from "react-router-dom";

type Direction = "xml-to-json" | "json-to-xml";

function XmlToJsonPage() {
    const navigate = useNavigate();

    const [direction, setDirection] =
        useState<Direction>("xml-to-json");

    const [xml, setXml] = useState("");
    const [jsonInput, setJsonInput] = useState("");
    const [json, setJson] = useState("");
    const [xmlOutput, setXmlOutput] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const convertXmlToJson = (node: Element): any => {
        const obj: Record<string, any> = {};

        if (node.attributes.length > 0) {
            obj["@attributes"] = {};

            Array.from(node.attributes).forEach((attribute) => {
                obj["@attributes"][attribute.name] =
                    attribute.value;
            });
        }

        const children = Array.from(node.children);

        if (children.length === 0) {
            const text = node.textContent?.trim();

            if (Object.keys(obj).length === 0) {
                return text || "";
            }

            if (text) {
                obj["#text"] = text;
            }

            return obj;
        }

        children.forEach((child) => {
            const key = child.tagName;
            const value = convertXmlToJson(child);

            if (obj[key] !== undefined) {
                if (!Array.isArray(obj[key])) {
                    obj[key] = [obj[key]];
                }

                obj[key].push(value);
            } else {
                obj[key] = value;
            }
        });

        return obj;
    };

    const escapeXml = (value: string) =>
        value
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&apos;");

    const isValidXmlName = (name: string) =>
        /^[A-Za-z_][A-Za-z0-9._:-]*$/.test(name) &&
        !name.startsWith("xmlns:");

    const jsonValueToXml = (
        name: string,
        value: any,
        depth = 0
    ): string => {
        const indent = "  ".repeat(depth);

        if (!isValidXmlName(name)) {
            throw new Error(`Invalid XML element name: ${name}`);
        }

        if (Array.isArray(value)) {
            return value
                .map((item) => jsonValueToXml(name, item, depth))
                .join("\n");
        }

        if (value === null || typeof value !== "object") {
            const text =
                value === null ? "" : String(value);

            return `${indent}<${name}>${escapeXml(text)}</${name}>`;
        }

        const attributes = value["@attributes"] ?? {};
        const textValue = value["#text"];
        const childKeys = Object.keys(value).filter(
            (key) => key !== "@attributes" && key !== "#text"
        );

        const attributeString = Object.entries(attributes)
            .map(([key, attributeValue]) => {
                if (
                    !isValidXmlName(key) ||
                    key.startsWith("xmlns")
                ) {
                    throw new Error(
                        `Invalid XML attribute name: ${key}`
                    );
                }

                if (
                    attributeValue !== null &&
                    typeof attributeValue === "object"
                ) {
                    throw new Error(
                        `Attribute "${key}" must have a scalar value.`
                    );
                }

                return ` ${key}="${escapeXml(
                    attributeValue == null
                        ? ""
                        : String(attributeValue)
                )}"`;
            })
            .join("");

        if (childKeys.length === 0) {
            const text =
                textValue === undefined
                    ? ""
                    : escapeXml(String(textValue));

            return `${indent}<${name}${attributeString}>${text}</${name}>`;
        }

        const lines = childKeys.flatMap((key) => {
            if (!isValidXmlName(key)) {
                throw new Error(
                    `Invalid XML element name: ${key}`
                );
            }

            const child = value[key];

            if (Array.isArray(child)) {
                return child.map((item) =>
                    jsonValueToXml(key, item, depth + 1)
                );
            }

            return jsonValueToXml(key, child, depth + 1);
        });

        if (textValue !== undefined) {
            lines.unshift(
                `${"  ".repeat(depth + 1)}${escapeXml(
                    String(textValue)
                )}`
            );
        }

        return [
            `${indent}<${name}${attributeString}>`,
            ...lines,
            `${indent}</${name}>`,
        ].join("\n");
    };

    const handleConvert = () => {
        setError("");
        setSuccess("");

        try {
            if (direction === "xml-to-json") {
                if (!xml.trim()) {
                    throw new Error("Please enter an XML message.");
                }

                const parser = new DOMParser();
                const document = parser.parseFromString(
                    xml,
                    "application/xml"
                );

                if (
                    document.querySelector("parsererror") ||
                    !document.documentElement
                ) {
                    throw new Error(
                        "Invalid XML. Please check your message."
                    );
                }

                const root = document.documentElement;

                const result = {
                    [root.tagName]: convertXmlToJson(root),
                };

                setJson(JSON.stringify(result, null, 2));
                setSuccess("XML converted to JSON successfully.");
            } else {
                if (!jsonInput.trim()) {
                    throw new Error("Please enter a JSON message.");
                }

                const parsed = JSON.parse(jsonInput);

                if (
                    parsed === null ||
                    typeof parsed !== "object" ||
                    Array.isArray(parsed) ||
                    Object.keys(parsed).length !== 1
                ) {
                    throw new Error(
                        "JSON must be an object containing exactly one root element."
                    );
                }

                const [rootName] = Object.keys(parsed);

                if (!isValidXmlName(rootName)) {
                    throw new Error(
                        `Invalid XML root element name: ${rootName}`
                    );
                }

                const body = jsonValueToXml(rootName, parsed[rootName]);

                const result =
                    '<?xml version="1.0" encoding="UTF-8"?>\n' +
                    body;

                // Confirm that the generated output is well-formed XML.
                const xmlDocument = new DOMParser().parseFromString(
                    result,
                    "application/xml"
                );

                if (xmlDocument.querySelector("parsererror")) {
                    throw new Error(
                        "Could not generate valid XML from this JSON structure."
                    );
                }

                setXmlOutput(result);
                setSuccess("JSON converted to XML successfully.");
            }
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Conversion failed. Please check your input."
            );

            if (direction === "xml-to-json") {
                setJson("");
            } else {
                setXmlOutput("");
            }
        }
    };

    const output =
        direction === "xml-to-json" ? json : xmlOutput;

    const handleCopy = async () => {
        if (!output) return;

        try {
            await navigator.clipboard.writeText(output);
            setSuccess("Output copied to clipboard.");
        } catch {
            setError(
                "Unable to copy automatically. Please select and copy the output."
            );
        }
    };

    const handleDownload = () => {
        if (!output) return;

        const isXml = direction === "json-to-xml";
        const blob = new Blob([output], {
            type: isXml
                ? "application/xml;charset=utf-8"
                : "application/json;charset=utf-8",
        });

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = isXml ? "converted.xml" : "converted.json";
        link.click();

        URL.revokeObjectURL(url);
    };

    const handleDirectionChange = (next: Direction) => {
        setDirection(next);
        setError("");
        setSuccess("");
    };

    return (
        <>
            <SEO
                title="XML ↔ JSON Converter | FintechSchema Developer Tools"
                description="Convert XML to JSON or JSON to XML with this free FintechSchema developer tool."
                path="/developer-tools/xml-to-json"
            />

            <div className="app">
                <header className="header">
                    <div className="logo">
                        <div className="logo-icon">ISO</div>
                        <div>
                            <div className="logo-title">
                                ISO 20022 Validator
                            </div>
                            <div className="logo-subtitle">
                                XML Tools
                            </div>
                        </div>
                    </div>

                    <nav>
                        <a href="/">Home</a>
                        <a href="/developer-tools/xml-to-json" aria-current="page">XML ↔ JSON</a>
                        <a href="/supported-messages">
                            Supported Messages
                        </a>
                        <a href="/about">About</a>
                    </nav>
                </header>

                <main className="main">
                    <section className="hero">
                        <h1>XML ↔ JSON Converter</h1>
                        <p>
                            Convert XML and JSON in either direction
                            with a simple developer tool.
                        </p>
                    </section>

                    <div className="converter-container">
                        <div
                            role="group"
                            aria-label="Conversion direction"
                            className="converter-direction"
                        >
                            <button
                                type="button"
                                className={
                                    direction === "xml-to-json"
                                        ? "direction-button active"
                                        : "direction-button"
                                }
                                aria-pressed={
                                    direction === "xml-to-json"
                                }
                                onClick={() =>
                                    handleDirectionChange("xml-to-json")
                                }
                            >
                                XML → JSON
                            </button>

                            <button
                                type="button"
                                className={
                                    direction === "json-to-xml"
                                        ? "direction-button active"
                                        : "direction-button"
                                }
                                aria-pressed={
                                    direction === "json-to-xml"
                                }
                                onClick={() =>
                                    handleDirectionChange("json-to-xml")
                                }
                            >
                                JSON → XML
                            </button>
                        </div>

                        <div className="converter-panel">
                            <div className="converter-header">
                                <h2>
                                    {direction === "xml-to-json"
                                        ? "XML Input"
                                        : "JSON Input"}
                                </h2>
                            </div>

                            <textarea
                                className="converter-editor"
                                value={
                                    direction === "xml-to-json"
                                        ? xml
                                        : jsonInput
                                }
                                onChange={(event) => {
                                    if (
                                        direction === "xml-to-json"
                                    ) {
                                        setXml(event.target.value);
                                    } else {
                                        setJsonInput(
                                            event.target.value
                                        );
                                    }

                                    setError("");
                                    setSuccess("");
                                }}
                                placeholder={
                                    direction === "xml-to-json"
                                        ? "Paste your XML here..."
                                        : 'Paste JSON with one root element, e.g. {"payment": {"amount": 100}}'
                                }
                                spellCheck={false}
                            />
                        </div>

                        <div className="converter-action">
                            <button
                                className="convert-button"
                                onClick={handleConvert}
                            >
                                {direction === "xml-to-json"
                                    ? "Convert to JSON →"
                                    : "Convert to XML →"}
                            </button>

                            {error && (
                                <p
                                    className="converter-error"
                                    role="alert"
                                >
                                    {error}
                                </p>
                            )}

                            {success && !error && (
                                <p role="status">{success}</p>
                            )}
                        </div>

                        <div className="converter-panel">
                            <div className="converter-header">
                                <h2>
                                    {direction === "xml-to-json"
                                        ? "JSON Output"
                                        : "XML Output"}
                                </h2>

                                {output && (
                                    <div className="converter-output-actions">
                                        <button
                                            className="copy-button"
                                            onClick={handleCopy}
                                        >
                                            Copy
                                        </button>
                                        <button
                                            className="copy-button"
                                            onClick={handleDownload}
                                        >
                                            Download
                                        </button>
                                    </div>
                                )}
                            </div>

                            <textarea
                                className="converter-editor json-output"
                                value={output}
                                readOnly
                                placeholder={
                                    direction === "xml-to-json"
                                        ? "Converted JSON will appear here..."
                                        : "Converted XML will appear here..."
                                }
                                spellCheck={false}
                            />
                        </div>

                        <p className="converter-note">
                            Note: XML and JSON have different data models.
                            Attributes, namespaces, repeated elements, and
                            data types may require specific conventions.
                            This tool performs general conversion; it does
                            not guarantee ISO 20022 schema validity.
                        </p>

                        <button
                            className="back-button"
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

export default XmlToJsonPage;
