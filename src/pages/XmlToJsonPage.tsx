import { useState } from "react";
import SEO from "../components/SEO";
import { useNavigate } from "react-router-dom";

function XmlToJsonPage() {

    const navigate = useNavigate();

    const [xml, setXml] = useState("");

    const [json, setJson] = useState("");

    const [error, setError] = useState("");


    const convertXmlToJson = (
        node: Element
    ): any => {

        const obj: any = {};


        // Handle attributes
        if (node.attributes.length > 0) {

            obj["@attributes"] = {};

            Array.from(node.attributes).forEach(
                (attribute) => {

                    obj["@attributes"][
                        attribute.name
                    ] = attribute.value;

                }
            );

        }


        const children =
            Array.from(node.children);


        // If there are no child elements,
        // return the text value
        if (children.length === 0) {

            const text =
                node.textContent?.trim();

            if (Object.keys(obj).length === 0) {

                return text || "";

            }


            if (text) {

                obj["#text"] = text;

            }

            return obj;

        }


        children.forEach((child) => {

            const key =
                child.tagName;

            const value =
                convertXmlToJson(child);


            // If the same element occurs multiple times,
            // convert it into an array
            if (obj[key] !== undefined) {

                if (!Array.isArray(obj[key])) {

                    obj[key] = [
                        obj[key]
                    ];

                }

                obj[key].push(value);

            } else {

                obj[key] = value;

            }

        });


        return obj;

    };


    const handleConvert = () => {

        if (!xml.trim()) {

            setError(
                "Please enter an XML message."
            );

            return;

        }


        try {

            setError("");


            const parser =
                new DOMParser();


            const xmlDocument =
                parser.parseFromString(
                    xml,
                    "application/xml"
                );


            const parserError =
                xmlDocument.querySelector(
                    "parsererror"
                );


            if (parserError) {

                setJson("");

                setError(
                    "Invalid XML. Please check your message."
                );

                return;

            }


            const rootElement =
                xmlDocument.documentElement;


            const result = {

                [rootElement.tagName]:
                    convertXmlToJson(
                        rootElement
                    )

            };


            setJson(
                JSON.stringify(
                    result,
                    null,
                    2
                )
            );


        } catch (error) {

            console.error(
                "XML conversion failed:",
                error
            );

            setError(
                "Unable to convert XML to JSON."
            );

        }

    };


    const handleCopy = async () => {

        if (!json) {
            return;
        }


        try {

            await navigator.clipboard.writeText(
                json
            );

            alert(
                "JSON copied to clipboard."
            );

        } catch (error) {

            console.error(
                "Copy failed:",
                error
            );

        }

    };


    return (
        <>
        <SEO
        title={'XML to JSON Converter | FintechSchema Developer Tools'}
        description={'Convert XML data to JSON quickly with this free developer tool from FintechSchema. Useful for ISO 20022 and payment messaging workflows.'}
        path={'/xml-to-json'}
      />

        <div className="app">


            {/* Header */}

            <header className="header">

                <div className="logo">

                    <div className="logo-icon">
                        ISO
                    </div>


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

                    <a href="/">
                        Home
                    </a>

                    <a href="/xml-to-json">
                        XML to JSON
                    </a>


                    <a href="/supported-messages">
                        Supported Messages
                    </a>


                    <a href="/about">
                        About
                    </a>

                </nav>

            </header>


            <main className="main">


                <section className="hero">

                    <h1>
                        XML to JSON Converter
                    </h1>


                    <p>
                        Convert XML messages into a
                        readable JSON structure.
                    </p>

                </section>


                <div className="converter-container">


                    {/* XML Input */}

                    <div className="converter-panel">

                        <div className="converter-header">

                            <h2>
                                XML Input
                            </h2>

                        </div>


                        <textarea
                            className="converter-editor"
                            value={xml}
                            onChange={(e) =>
                                setXml(
                                    e.target.value
                                )
                            }
                            placeholder="Paste your XML here..."
                        />

                    </div>


                    {/* Convert Button */}

                    <div className="converter-action">

                        <button
                            className="convert-button"
                            onClick={handleConvert}
                        >

                            Convert to JSON →

                        </button>


                        {error && (

                            <p className="converter-error">

                                {error}

                            </p>

                        )}

                    </div>


                    {/* JSON Output */}

                    <div className="converter-panel">

                        <div className="converter-header">

                            <h2>
                                JSON Output
                            </h2>


                            {json && (

                                <button
                                    className="copy-button"
                                    onClick={handleCopy}
                                >

                                    Copy

                                </button>

                            )}

                        </div>


                        <textarea
                            className="converter-editor json-output"
                            value={json}
                            readOnly
                            placeholder="Converted JSON will appear here..."
                        />

                    </div>


                    <button
                        className="back-button"
                        onClick={() =>
                            navigate("/")
                        }
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