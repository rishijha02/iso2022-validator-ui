import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  generateMessage
} from "../services/MessagegeneratorService";

import {
  validateXml
} from "../services/validatorService";

import {
  validateWithCustomXsd
} from "../services/customxsdService";

import XmlEditor from "../components/XmlEditor";
import ValidationResult from "../components/ValidationResult";

import type {
  MessageGenerationResponse
} from "../types/messagegenerator";

import type {
  ValidationResponse
} from "../types/validation";


function formatXml(xml: string): string {

  let formatted = "";
  let indent = 0;
  const tab = "  ";

  const nodes = xml
    .replace(/>\s*</g, "><")
    .replace(/></g, ">\n<")
    .split("\n");

  for (let node of nodes) {

    node = node.trim();

    if (!node) {
      continue;
    }

    if (node.startsWith("</")) {
      indent = Math.max(indent - 1, 0);
    }

    formatted +=
      tab.repeat(indent) +
      node +
      "\n";

    if (
      node.startsWith("<") &&
      !node.startsWith("</") &&
      !node.startsWith("<?") &&
      !node.startsWith("<!") &&
      !node.endsWith("/>") &&
      !node.includes("</")
    ) {
      indent++;
    }
  }

  return formatted.trim();
}


function MessageGeneratorPage() {

  const navigate = useNavigate();

  const [messageType, setMessageType] =
    useState("pacs.008");

  const [geography, setGeography] =
    useState("ISO");

  const [debtorName, setDebtorName] =
    useState("");

  const [debtorIban, setDebtorIban] =
    useState("");

  const [debtorBic, setDebtorBic] =
    useState("");

  const [creditorName, setCreditorName] =
    useState("");

  const [creditorIban, setCreditorIban] =
    useState("");

  const [creditorBic, setCreditorBic] =
    useState("");

  const [amount, setAmount] =
    useState("");

  const [currency, setCurrency] =
    useState("EUR");

  const [endToEndId, setEndToEndId] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [result, setResult] =
    useState<MessageGenerationResponse | null>(null);

  /*
   * Validation state.
   * These are deliberately kept separate from generation state so the
   * generated XML can be edited and validated without generating again.
   */
  const [validationProfile, setValidationProfile] =
    useState("ISO20022");

  const [validationResult, setValidationResult] =
    useState<ValidationResponse | null>(null);

  const [validationLoading, setValidationLoading] =
    useState(false);

  const [customXsdFile, setCustomXsdFile] =
    useState<File | null>(null);

  const xsdInputRef =
    useRef<HTMLInputElement>(null);


  /*
   * Keep the generated XML in local state so the same XmlEditor used by
   * ValidatorPage can be used here as well.
   */
  const [generatedXml, setGeneratedXml] =
    useState("");


  const handleGenerate = async () => {

    if (
      !debtorName.trim() ||
      !debtorIban.trim() ||
      !debtorBic.trim()
    ) {
      alert("Please enter debtor details.");
      return;
    }

    if (
      !creditorName.trim() ||
      !creditorIban.trim() ||
      !creditorBic.trim()
    ) {
      alert("Please enter creditor details.");
      return;
    }

    if (!amount.trim()) {
      alert("Please enter amount.");
      return;
    }

    setLoading(true);
    setResult(null);
    setValidationResult(null);

    try {

      const response =
        await generateMessage(
          {
            messageType,

            debtorName,
            debtorIban,
            debtorBic,

            creditorName,
            creditorIban,
            creditorBic,

            amount,
            currency,

            endToEndId
          },

          geography
        );

      setResult(response);

      if (response.success && response.xml) {

        setGeneratedXml(
          response.xml
        );

        /*
         * Automatically select the same validation profile as the
         * generated geography.
         */
        if (geography === "SEPA") {
          setValidationProfile("SEPA");
        } else if (geography === "CBPR_PLUS") {
          setValidationProfile("CBPR_PLUS");
        } else {
          setValidationProfile("ISO20022");
        }

      } else {
        setGeneratedXml("");
      }

    } catch (error) {

      console.error(
        "Message generation failed:",
        error
      );

      alert(
        "Unable to generate message."
      );

    } finally {

      setLoading(false);

    }
  };


  /*
   * Format the generated XML.
   * This works on the same XML currently displayed in XmlEditor.
   */
  const handleFormatXml = () => {

    if (!generatedXml.trim()) {
      return;
    }

    try {

      setGeneratedXml(
        formatXml(generatedXml)
      );

    } catch (error) {

      console.error(
        "Unable to format generated XML:",
        error
      );

      alert("Unable to format XML.");

    }
  };


  /*
   * Open custom XSD file selector.
   */
  const handleXsdButtonClick = () => {
    xsdInputRef.current?.click();
  };


  const handleXsdFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {

    const file =
      event.target.files?.[0];

    if (file) {

      setCustomXsdFile(file);
      setValidationResult(null);

    }

    event.target.value = "";

  };


  const handleRemoveXsd = () => {

    setCustomXsdFile(null);
    setValidationResult(null);

  };


  /*
   * Validate the generated/edited XML using exactly the same validation
   * services used by the main Validator page.
   */
  const handleValidate = async () => {

    if (!generatedXml.trim()) {
      return;
    }

    if (
      validationProfile === "CUSTOM" &&
      !customXsdFile
    ) {
      alert(
        "Upload a custom XSD file before validating."
      );
      return;
    }

    setValidationLoading(true);
    setValidationResult(null);

    try {

      const response =
        validationProfile === "CUSTOM" &&
        customXsdFile
          ? await validateWithCustomXsd(
              generatedXml,
              customXsdFile
            )
          : await validateXml(
              generatedXml,
              validationProfile
            );

      setValidationResult(response);

    } catch (error) {

      console.error(
        "Validation failed:",
        error
      );

      alert(
        "Unable to connect to the validation server."
      );

    } finally {

      setValidationLoading(false);

    }

  };


  const copyXml = async () => {

    if (!generatedXml) {
      return;
    }

    await navigator.clipboard.writeText(
      generatedXml
    );

    alert(
      "XML copied to clipboard."
    );

  };


  const downloadXml = () => {

    if (!generatedXml) {
      return;
    }

    const blob =
      new Blob(
        [generatedXml],
        {
          type: "application/xml"
        }
      );

    const url =
      URL.createObjectURL(blob);

    const a =
      document.createElement("a");

    a.href = url;

    a.download =
      `${messageType.replace(".", "_")}.xml`;

    a.click();

    URL.revokeObjectURL(url);

  };


  const viewSummary = () => {

    if (!generatedXml.trim()) {
      return;
    }

    navigate(
      "/summary",
      {
        state: {
          xml: generatedXml
        }
      }
    );

  };


  return (

    <div className="app">

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

          <Link to="/documentation">
            Documentation
          </Link>

          <Link to="/about">
            About
          </Link>

        </nav>

      </header>


      <main className="generator-page">

        <section className="generator-hero">

          <h1>
            ISO 20022 Message Generator
          </h1>

          <p>
            Generate ISO 20022 messages using
            simple business-level inputs.
          </p>

        </section>


        <section className="generator-card">

          {/* Message Configuration */}

          <div className="generator-section">

            <h2>
              Message Configuration
            </h2>

            <div className="generator-grid">

              <div className="form-group">

                <label>
                  Message Type
                </label>

                <select
                  value={messageType}
                  onChange={(e) => {
                    setMessageType(
                      e.target.value
                    );
                    setResult(null);
                    setValidationResult(null);
                  }}
                >

                  <option value="pacs.008">
                    pacs.008 — Credit Transfer
                  </option>

                  <option
                    value="pacs.002"
                    disabled
                  >
                    pacs.002 — Payment Status
                    (Coming Soon)
                  </option>

                </select>

              </div>


              <div className="form-group">

                <label>
                  Geography / Profile
                </label>

                <select
                  value={geography}
                  onChange={(e) => {
                    setGeography(
                      e.target.value
                    );
                    setResult(null);
                    setValidationResult(null);
                  }}
                >

                  <option value="ISO">
                    ISO 20022
                  </option>

                  <option value="SEPA">
                    SEPA
                  </option>

                  <option value="CBPR_PLUS">
                    CBPR+
                  </option>

                </select>

              </div>

            </div>

          </div>


          {/* Debtor */}

          <div className="generator-section">

            <h2>
              Debtor
            </h2>

            <div className="generator-grid">

              <div className="form-group">

                <label>
                  Name
                </label>

                <input
                  value={debtorName}
                  onChange={(e) =>
                    setDebtorName(
                      e.target.value
                    )
                  }
                  placeholder="Debtor name"
                />

              </div>


              <div className="form-group">

                <label>
                  IBAN
                </label>

                <input
                  value={debtorIban}
                  onChange={(e) =>
                    setDebtorIban(
                      e.target.value
                    )
                  }
                  placeholder="DE89370400440532013000"
                />

              </div>


              <div className="form-group">

                <label>
                  BIC
                </label>

                <input
                  value={debtorBic}
                  onChange={(e) =>
                    setDebtorBic(
                      e.target.value
                    )
                  }
                  placeholder="COBADEFFXXX"
                />

              </div>

            </div>

          </div>


          {/* Creditor */}

          <div className="generator-section">

            <h2>
              Creditor
            </h2>

            <div className="generator-grid">

              <div className="form-group">

                <label>
                  Name
                </label>

                <input
                  value={creditorName}
                  onChange={(e) =>
                    setCreditorName(
                      e.target.value
                    )
                  }
                  placeholder="Creditor name"
                />

              </div>


              <div className="form-group">

                <label>
                  IBAN
                </label>

                <input
                  value={creditorIban}
                  onChange={(e) =>
                    setCreditorIban(
                      e.target.value
                    )
                  }
                  placeholder="FR7630006000011234567890189"
                />

              </div>


              <div className="form-group">

                <label>
                  BIC
                </label>

                <input
                  value={creditorBic}
                  onChange={(e) =>
                    setCreditorBic(
                      e.target.value
                    )
                  }
                  placeholder="AGRIFRPPXXX"
                />

              </div>

            </div>

          </div>


          {/* Payment */}

          <div className="generator-section">

            <h2>
              Payment Details
            </h2>

            <div className="generator-grid">

              <div className="form-group">

                <label>
                  Amount
                </label>

                <input
                  type="number"
                  value={amount}
                  onChange={(e) =>
                    setAmount(
                      e.target.value
                    )
                  }
                  placeholder="1250.00"
                />

              </div>


              <div className="form-group">

                <label>
                  Currency
                </label>

                <select
                  value={currency}
                  onChange={(e) =>
                    setCurrency(
                      e.target.value
                    )
                  }
                >

                  <option value="EUR">
                    EUR
                  </option>

                  <option value="USD">
                    USD
                  </option>

                  <option value="GBP">
                    GBP
                  </option>

                  <option value="CHF">
                    CHF
                  </option>

                </select>

              </div>


              <div className="form-group">

                <label>
                  End-to-End ID
                </label>

                <input
                  value={endToEndId}
                  onChange={(e) =>
                    setEndToEndId(
                      e.target.value
                    )
                  }
                  placeholder="Optional"
                />

              </div>

            </div>

          </div>


          <div className="generator-action">

            <button
              className="summary-button"
              onClick={handleGenerate}
              disabled={loading}
            >

              {loading
                ? "Generating..."
                : "Generate Message"}

            </button>

          </div>

        </section>


        {/* Generated XML + validation */}

        {result?.success && generatedXml && (

          <>

            <section className="generated-result">

              <div className="generated-result-header">

                <div>

                  <h2>
                    Generated Message
                  </h2>

                  <p>

                    {result.messageType}
                    {" • "}
                    {result.geography}
                    {" • "}
                    version {result.version}

                  </p>

                </div>


                <div className="generated-actions">

                  <button
                    onClick={copyXml}
                  >
                    Copy XML
                  </button>

                  <button
                    onClick={downloadXml}
                  >
                    Download XML
                  </button>

                </div>

              </div>


              {/* Same XML editor used on the main Validator page */}

              <XmlEditor
                xml={generatedXml}
                onXmlChange={(value) => {
                  setGeneratedXml(value);
                  setValidationResult(null);
                }}
                onValidate={handleValidate}
                onFormat={handleFormatXml}
                loading={validationLoading}
              />


              {/* Validation Profile */}

              <section className="validation-profile-section">

                <div className="profile-label-container">

                  <label htmlFor="generatorValidationProfile">
                    Validation Profile
                  </label>

                  <span>
                    Select the schema/profile to validate the generated XML against
                  </span>

                </div>


                <div className="profile-select-wrapper">

                  <select
                    id="generatorValidationProfile"
                    value={validationProfile}
                    onChange={(e) => {
                      setValidationProfile(
                        e.target.value
                      );
                      setValidationResult(null);
                    }}
                  >

                    <option value="ISO20022">
                      ISO 20022 Standard
                    </option>

                    <option value="SEPA">
                      SEPA Payments
                    </option>

                    <option value="CBPR_PLUS">
                      CBPR+ / Swift
                    </option>

                    <option value="CUSTOM">
                      Custom XSD
                    </option>

                  </select>

                </div>

              </section>


              {/* Custom XSD upload */}

              {validationProfile === "CUSTOM" && (

                <div className="custom-xsd-row">

                  <input
                    ref={xsdInputRef}
                    type="file"
                    accept=".xsd,text/xml,application/xml"
                    hidden
                    onChange={handleXsdFileChange}
                  />


                  {!customXsdFile ? (

                    <button
                      type="button"
                      className="custom-xsd-link"
                      onClick={handleXsdButtonClick}
                    >
                      Upload Custom XSD
                    </button>

                  ) : (

                    <div className="custom-xsd-file">

                      <span className="custom-xsd-filename">
                        {customXsdFile.name}
                      </span>

                      <button
                        type="button"
                        className="custom-xsd-remove"
                        onClick={handleRemoveXsd}
                      >
                        Remove
                      </button>

                    </div>

                  )}

                </div>

              )}


              {/* Validation result */}

              {validationResult && (

                <>

                  <ValidationResult
                    result={validationResult}
                  />


                  {validationResult.valid && (

                    <div className="summary-action">

                      <button
                        className="summary-button"
                        onClick={viewSummary}
                      >
                        View Message Summary →
                      </button>

                    </div>

                  )}

                </>

              )}

            </section>

          </>

        )}


        {/* Generation error */}

        {result && !result.success && (

          <section className="generated-result">

            <div className="generator-error">

              <h2>
                Unable to Generate Message
              </h2>

              <p>
                {result.error}
              </p>

            </div>

          </section>

        )}

      </main>

    </div>
  );
}

export default MessageGeneratorPage;
