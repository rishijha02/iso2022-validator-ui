import SEO from "../components/SEO";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  validateIban,
  validateBic,
} from "../services/identifierValidatorService";

import type {
  IdentifierValidationResponse
} from "../types/identifier";

function IdentifierValidatorPage() {

  const navigate = useNavigate();

  const [iban, setIban] = useState("");
  const [bic, setBic] = useState("");

  const [ibanLoading, setIbanLoading] =
    useState(false);

  const [bicLoading, setBicLoading] =
    useState(false);

  const [ibanResult, setIbanResult] =
    useState<IdentifierValidationResponse | null>(null);

  const [bicResult, setBicResult] =
    useState<IdentifierValidationResponse | null>(null);


  const handleIbanValidation = async () => {

    if (!iban.trim()) {
      alert("Please enter an IBAN.");
      return;
    }

    setIbanLoading(true);
    setIbanResult(null);

    try {

      const response =
        await validateIban(iban.trim());

      setIbanResult(response);

    } catch (error) {

      console.error(
        "IBAN validation failed:",
        error
      );

      alert(
        "Unable to validate IBAN."
      );

    } finally {

      setIbanLoading(false);

    }

  };


  const handleBicValidation = async () => {

    if (!bic.trim()) {
      alert("Please enter a BIC.");
      return;
    }

    setBicLoading(true);
    setBicResult(null);

    try {

      const response =
        await validateBic(bic.trim());

      setBicResult(response);

    } catch (error) {

      console.error(
        "BIC validation failed:",
        error
      );

      alert(
        "Unable to validate BIC."
      );

    } finally {

      setBicLoading(false);

    }

  };


  return (
      <>
      <SEO
        title={'IBAN & BIC Validator | FintechSchema'}
        description={'Validate IBAN and BIC identifiers with FintechSchema developer tools. Check payment account and bank identifier formats quickly.'}
        path={'/developer-tools/identifier-validator'}
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

          <Link to="/developer-tools">
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


      <main className="identifier-page">


        {/* Hero */}

        <section className="identifier-hero">

          <h1>
            IBAN & BIC Validator
          </h1>

          <p>
            Validate banking identifiers used in
            international and cross-border payments.
          </p>

        </section>


        <div className="identifier-grid">


          {/* IBAN */}

          <section className="identifier-card">

            <div className="identifier-card-header">

              <div>

                <h2>
                  IBAN Validator
                </h2>

                <p>
                  Validate the structure and checksum
                  of an International Bank Account Number.
                </p>

              </div>

              <span className="identifier-badge">
                IBAN
              </span>

            </div>


            <input
              type="text"
              placeholder="Example: DE89370400440532013000"
              value={iban}
              onChange={(e) => {
                setIban(e.target.value);
                setIbanResult(null);
              }}
              className="identifier-input"
            />


            <button
              className="summary-button"
              onClick={handleIbanValidation}
              disabled={ibanLoading}
            >

              {ibanLoading
                ? "Validating..."
                : "Validate IBAN"}

            </button>


            {ibanResult && (

  <div
    className={
      ibanResult.valid
        ? "identifier-result valid"
        : "identifier-result invalid"
    }
  >

    <div className="identifier-result-title">

      {ibanResult.valid
        ? "✓ Valid IBAN"
        : "✕ Invalid IBAN"}

    </div>


    <p>
      {ibanResult.message}
    </p>


    {ibanResult.details &&
      Object.keys(ibanResult.details).length > 0 && (

      <div className="identifier-details">

        {Object.entries(
          ibanResult.details
        ).map(([key, value]) => (

          <div key={key}>

            <span>
              {key}
            </span>

            <strong>
              {value}
            </strong>

          </div>

        ))}

      </div>

    )}

  </div>

)}

          </section>


          {/* BIC */}

          <section className="identifier-card">

            <div className="identifier-card-header">

              <div>

                <h2>
                  BIC / SWIFT Validator
                </h2>

                <p>
                  Validate the format of a Bank
                  Identifier Code used in SWIFT
                  and international payments.
                </p>

              </div>

              <span className="identifier-badge">
                BIC
              </span>

            </div>


            <input
              type="text"
              placeholder="Example: DEUTDEFFXXX"
              value={bic}
              onChange={(e) => {
                setBic(e.target.value);
                setBicResult(null);
              }}
              className="identifier-input"
            />


            <button
              className="summary-button"
              onClick={handleBicValidation}
              disabled={bicLoading}
            >

              {bicLoading
                ? "Validating..."
                : "Validate BIC"}

            </button>


            {bicResult && (

  <div
    className={
      bicResult.valid
        ? "identifier-result valid"
        : "identifier-result invalid"
    }
  >

    <div className="identifier-result-title">

      {bicResult.valid
        ? "✓ Valid BIC"
        : "✕ Invalid BIC"}

    </div>


    <p>
      {bicResult.message}
    </p>


    {bicResult.details &&
      Object.keys(bicResult.details).length > 0 && (

      <div className="identifier-details">

        {Object.entries(
          bicResult.details
        ).map(([key, value]) => (

          <div key={key}>

            <span>
              {key}
            </span>

            <strong>
              {value}
            </strong>

          </div>

        ))}

      </div>

    )}

  </div>

)}

          </section>


        </div>


        {/* Information Section */}

        <section className="identifier-info">

          <div>

            <h3>
              What is an IBAN?
            </h3>

            <p>
              An IBAN is an International Bank Account
              Number used to identify bank accounts
              across participating countries.
            </p>

          </div>


          <div>

            <h3>
              What is a BIC?
            </h3>

            <p>
              A BIC, also known as a SWIFT code,
              identifies a financial institution
              in international payment messages.
            </p>

          </div>

        </section>


      </main>

    </div>

  </>

  );

}

export default IdentifierValidatorPage;