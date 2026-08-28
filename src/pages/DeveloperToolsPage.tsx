import { Link, useNavigate } from "react-router-dom";

function DeveloperToolsPage() {

    const navigate = useNavigate();

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


            <main className="developer-tools-page">


                {/* Hero */}

                <section className="tools-hero">

                    <h1>
                        Developer Tools
                    </h1>


                    <p>
                        A collection of utilities to help developers
                        work with XML, JSON, IBAN, BIC, and
                        ISO 20022 messages.
                    </p>

                </section>


                {/* Tools Grid */}

                <section className="tools-grid">


                    {/* XML JSON */}

                    <Link
                        to="/xml-to-json"
                        className="tool-card"
                    >

                        <div className="tool-icon">

                            🔄

                        </div>


                        <h2>
                            XML ↔ JSON Converter
                        </h2>


                        <p>
                            Convert XML messages to JSON and
                            convert JSON structures back into XML.
                        </p>


                        <span className="tool-link">

                            Open Tool →

                        </span>

                    </Link>



                    {/* IBAN BIC */}

                    <Link
                        to="/developer-tools/identifier-validator"
                        className="tool-card"
                    >

                        <div className="tool-icon">

                            🏦

                        </div>


                        <h2>
                            IBAN / BIC Validator
                        </h2>


                        <p>
                            Validate International Bank Account
                            Numbers and SWIFT/BIC codes.
                        </p>


                        <span className="tool-link">

                            Open Tool →

                        </span>

                    </Link>


                    {/* Future Tool */}

                    <div className="tool-card tool-card-disabled">

                        <div className="tool-icon">

                            ⚡

                        </div>


                        <h2>
                            ISO 20022 Sample Generator
                        </h2>


                        <p>
                            Generate sample ISO 20022 messages
                            for testing and development.
                        </p>


                        <span className="coming-soon">

                            Coming Soon

                        </span>

                    </div>


                </section>


                <div className="tools-back">

                    <button
                        className="summary-button"
                        onClick={() => navigate("/")}
                    >

                        ← Back to Validator

                    </button>

                </div>


            </main>

        </div>

    );

}

export default DeveloperToolsPage;