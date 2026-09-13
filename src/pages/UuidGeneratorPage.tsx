import { useState } from "react";
import SEO from "../components/SEO";
import { Link, useNavigate } from "react-router-dom";

function UuidGeneratorPage() {

    const navigate = useNavigate();

    const [uuids, setUuids] =
        useState<string[]>([]);

    const [count, setCount] =
        useState(1);


    const generateUuid = () => {

        const generated: string[] = [];

        for (let i = 0; i < count; i++) {

            generated.push(
                crypto.randomUUID()
            );

        }

        setUuids(generated);

    };


    const copyUuid = async (
        uuid: string
    ) => {

        try {

            await navigator.clipboard.writeText(uuid);

        } catch (error) {

            console.error(
                "Unable to copy UUID:",
                error
            );

        }

    };


    const copyAll = async () => {

        if (uuids.length === 0) {
            return;
        }

        try {

            await navigator.clipboard.writeText(
                uuids.join("\n")
            );

        } catch (error) {

            console.error(
                "Unable to copy UUIDs:",
                error
            );

        }

    };


    const clearAll = () => {

        setUuids([]);

    };


    return (
        <>
        <SEO
        title={'UUID Generator | FintechSchema Developer Tools'}
        description={'Generate UUIDs quickly with this free developer tool for fintech and software developers.'}
        path={'/developer-tools/uuid-generator'}
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
                        UUID Generator
                    </h1>

                    <p>
                        Generate UUID v4 values for testing,
                        transaction identifiers, UETR,
                        correlation IDs, and development.
                    </p>

                </section>


                {/* Generator */}

                <section className="developer-tool-card">

                    <div className="developer-tool-header">

                        <div>

                            <h2>
                                Generate UUID
                            </h2>

                            <p>
                                Generate one or multiple
                                universally unique identifiers.
                            </p>

                        </div>

                        <span className="developer-tool-badge">
                            UUID v4
                        </span>

                    </div>


                    <div className="uuid-options">

                        <label>
                            Number of UUIDs
                        </label>

                        <select
                            value={count}
                            onChange={(e) =>
                                setCount(
                                    Number(e.target.value)
                                )
                            }
                            className="uuid-count-select"
                        >

                            <option value={1}>
                                1
                            </option>

                            <option value={5}>
                                5
                            </option>

                            <option value={10}>
                                10
                            </option>

                            <option value={20}>
                                20
                            </option>

                        </select>

                    </div>


                    <div className="developer-tool-actions">

                        <button
                            className="summary-button"
                            onClick={generateUuid}
                        >
                            Generate UUID
                        </button>

                        <button
                            className="tool-clear-button"
                            onClick={clearAll}
                        >
                            Clear
                        </button>

                    </div>


                    {uuids.length > 0 && (

                        <div className="uuid-results">

                            {uuids.map(
                                (uuid, index) => (

                                    <div
                                        className="uuid-result-row"
                                        key={uuid}
                                    >

                                        <span>
                                            {index + 1}
                                        </span>

                                        <code>
                                            {uuid}
                                        </code>

                                        <button
                                            className="tool-copy-button"
                                            onClick={() =>
                                                copyUuid(uuid)
                                            }
                                        >
                                            Copy
                                        </button>

                                    </div>

                                )
                            )}

                        </div>

                    )}


                    {uuids.length > 1 && (

                        <div className="developer-tool-output-actions">

                            <button
                                className="tool-copy-button"
                                onClick={copyAll}
                            >
                                Copy All
                            </button>

                        </div>

                    )}

                </section>


                {/* Information */}

                <section className="developer-tool-info">

                    <div>

                        <h3>
                            What is UUID v4?
                        </h3>

                        <p>
                            UUID version 4 generates an identifier
                            using randomly generated values.
                            It is commonly used where applications
                            need unique identifiers.
                        </p>

                    </div>


                    <div>

                        <h3>
                            Fintech Use Cases
                        </h3>

                        <p>
                            UUIDs can be useful for transaction
                            identifiers, correlation IDs,
                            request IDs, test data, and UETR
                            generation during development.
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

    </>

    );

}

export default UuidGeneratorPage;