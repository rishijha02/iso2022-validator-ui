import SEO from "../components/SEO";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import {
  generateMessage
} from "../services/MessagegeneratorService";

import {
  validateXml
} from "../services/validatorService";

import {
  validateWithCustomXsd
} from "../services/customxsdService";

import {
  validateIban,
  validateBic
} from "../services/identifierValidatorService";

import type {
  IdentifierValidationResponse
} from "../types/identifier";

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


type GenerationMode = "DEFAULT" | "CUSTOM";
type IdentifierField = "debtorIban" | "debtorBic" | "creditorIban" | "creditorBic";
type IdentifierState = {
  status: "idle" | "loading" | "valid" | "invalid";
  message?: string;
};

const DEFAULT_VALUES = {
  debtorName: "John Doe",
  debtorIban: "DE89370400440532013000",
  debtorBic: "COBADEFFXXX",
  creditorName: "Jane Smith",
  creditorIban: "FR7630006000011234567890189",
  creditorBic: "AGRIFRPPXXX",
  amount: "1000.00",
  currency: "EUR",
  endToEndId: "E2E-DEMO-001"
};

const PACS_008_VERSIONS = [
  "001.09",
  "001.10",
  "001.11",
  "001.12",
  "001.13",
  "001.14"
];

function MessageGeneratorPage() {

  const navigate = useNavigate();
  const location = useLocation();

  const navigationState = location.state as {
    messageType?: string;
    version?: string;
  } | null;

  const [messageType, setMessageType] =
    useState(navigationState?.messageType ?? "pacs.008");

  const [selectedVersion, setSelectedVersion] =
    useState(navigationState?.version ?? "001.14");

  const [generationMode, setGenerationMode] =
    useState<GenerationMode>(navigationState?.messageType ? "DEFAULT" : "CUSTOM");

  const generatorSupported = messageType === "pacs.008";

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

  const [identifierStates, setIdentifierStates] =
    useState<Record<IdentifierField, IdentifierState>>({
      debtorIban: { status: "idle" },
      debtorBic: { status: "idle" },
      creditorIban: { status: "idle" },
      creditorBic: { status: "idle" }
    });

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


  useEffect(() => {
    const state = location.state as {
      messageType?: string;
      version?: string;
    } | null;

    if (state?.messageType) {
      setMessageType(state.messageType);
    }

    if (state?.version) {
      setSelectedVersion(state.version);
    }
  }, [location.key, location.state]);


  const validateIdentifierField = async (
    field: IdentifierField,
    value: string
  ) => {

    const normalized = value.trim();

    const isIban = field.toLowerCase().includes("iban");
    const minimumLength = isIban ? 15 : 8;

    if (!normalized || normalized.length < minimumLength) {
      setIdentifierStates((current) => ({
        ...current,
        [field]: { status: "idle" }
      }));
      return;
    }

    setIdentifierStates((current) => ({
      ...current,
      [field]: { status: "loading" }
    }));

    try {
      const response: IdentifierValidationResponse =
        isIban
          ? await validateIban(normalized)
          : await validateBic(normalized);

      setIdentifierStates((current) => ({
        ...current,
        [field]: {
          status: response.valid ? "valid" : "invalid",
          message: response.message
        }
      }));

    } catch (error) {

      console.error(`Identifier validation failed for ${field}:`, error);

      setIdentifierStates((current) => ({
        ...current,
        [field]: {
          status: "invalid",
          message: "Unable to validate right now."
        }
      }));
    }
  };


  useEffect(() => {
    if (generationMode !== "CUSTOM") return;
    const timer = window.setTimeout(() => {
      void validateIdentifierField("debtorIban", debtorIban);
    }, 600);
    return () => window.clearTimeout(timer);
  }, [debtorIban, generationMode]);


  useEffect(() => {
    if (generationMode !== "CUSTOM") return;
    const timer = window.setTimeout(() => {
      void validateIdentifierField("debtorBic", debtorBic);
    }, 600);
    return () => window.clearTimeout(timer);
  }, [debtorBic, generationMode]);


  useEffect(() => {
    if (generationMode !== "CUSTOM") return;
    const timer = window.setTimeout(() => {
      void validateIdentifierField("creditorIban", creditorIban);
    }, 600);
    return () => window.clearTimeout(timer);
  }, [creditorIban, generationMode]);


  useEffect(() => {
    if (generationMode !== "CUSTOM") return;
    const timer = window.setTimeout(() => {
      void validateIdentifierField("creditorBic", creditorBic);
    }, 600);
    return () => window.clearTimeout(timer);
  }, [creditorBic, generationMode]);


  const getIdentifierStatus = (field: IdentifierField) => {
    const state = identifierStates[field];

    if (state.status === "loading") {
      return <span className="identifier-status loading">Checking...</span>;
    }

    if (state.status === "valid") {
      return <span className="identifier-status valid">✓ Valid</span>;
    }

    if (state.status === "invalid") {
      return (
        <span className="identifier-status invalid">
          ✕ {state.message || "Invalid value"}
        </span>
      );
    }

    return null;
  };


  const isCustomIdentifiersValid =
    identifierStates.debtorIban.status === "valid" &&
    identifierStates.debtorBic.status === "valid" &&
    identifierStates.creditorIban.status === "valid" &&
    identifierStates.creditorBic.status === "valid";


  const handleGenerate = async () => {

    const values =
      generationMode === "DEFAULT"
        ? DEFAULT_VALUES
        : {
            debtorName,
            debtorIban,
            debtorBic,
            creditorName,
            creditorIban,
            creditorBic,
            amount,
            currency,
            endToEndId
          };

    if (generationMode === "CUSTOM") {

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

      if (!isCustomIdentifiersValid) {
        alert("Please enter valid debtor and creditor IBAN/BIC values.");
        return;
      }
    }

    setLoading(true);
    setResult(null);
    setValidationResult(null);

    try {

      const response =
        await generateMessage(
          {
            messageType,

            debtorName: values.debtorName,
            debtorIban: values.debtorIban,
            debtorBic: values.debtorBic,

            creditorName: values.creditorName,
            creditorIban: values.creditorIban,
            creditorBic: values.creditorBic,

            amount: values.amount,
            currency: values.currency,

            endToEndId: values.endToEndId,
            version: selectedVersion
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
      <>
      <SEO
        title={'ISO 20022 Message Generator | PACS, PAIN & CAMT'}
        description={'Generate ISO 20022 payment messages with FintechSchema. Create PACS.008 messages with default or custom inputs and validate your data.'}
        path={'/message-generator'}
      />

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

          <div className="generator-mode-section">
            <h2>Generation Mode</h2>
            <p className="generator-mode-description">
              Choose a ready-to-use demo message or enter your own payment details.
            </p>

            <div className="generator-mode-grid">
              <button
                type="button"
                className={`generator-mode-option ${generationMode === "DEFAULT" ? "active" : ""}`}
                onClick={() => {
                  setGenerationMode("DEFAULT");
                  setResult(null);
                  setValidationResult(null);
                }}
              >
                <strong>Default Message</strong>
                <span>Generate using safe sample payment data.</span>
              </button>

              <button
                type="button"
                className={`generator-mode-option ${generationMode === "CUSTOM" ? "active" : ""}`}
                onClick={() => {
                  setGenerationMode("CUSTOM");
                  setResult(null);
                  setValidationResult(null);
                }}
              >
                <strong>Custom Inputs</strong>
                <span>Enter your own debtor, creditor and payment details.</span>
              </button>
            </div>
          </div>

          {/* Message Configuration */}

          <div className="generator-section">

            <h2>
              Message Configuration
            </h2>

            {!generatorSupported && (
              <div className="generator-support-note">
                Generation for {messageType} is not available yet. The selected version is preserved so you can use this page when its generator is added.
              </div>
            )}

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
                  Message Version
                </label>

                <select
                  value={selectedVersion}
                  onChange={(e) => {
                    setSelectedVersion(e.target.value);
                    setResult(null);
                    setValidationResult(null);
                  }}
                  disabled={messageType !== "pacs.008"}
                >
                  {messageType === "pacs.008" ? (
                    PACS_008_VERSIONS.map((version) => (
                      <option key={version} value={version}>
                        pacs.008.{version}
                      </option>
                    ))
                  ) : (
                    <option value={selectedVersion}>
                      {messageType}.{selectedVersion}
                    </option>
                  )}
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


          {generationMode === "CUSTOM" ? (
            <>

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
                {getIdentifierStatus("debtorIban")}

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
                {getIdentifierStatus("debtorBic")}

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
                {getIdentifierStatus("creditorIban")}

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
                {getIdentifierStatus("creditorBic")}

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

            </>
          ) : (
            <div className="default-message-preview">
              <h2>Default message data</h2>
              <div className="default-message-grid">
                <div><span>Debtor</span><strong>{DEFAULT_VALUES.debtorName}</strong><small>{DEFAULT_VALUES.debtorIban} • {DEFAULT_VALUES.debtorBic}</small></div>
                <div><span>Creditor</span><strong>{DEFAULT_VALUES.creditorName}</strong><small>{DEFAULT_VALUES.creditorIban} • {DEFAULT_VALUES.creditorBic}</small></div>
                <div><span>Payment</span><strong>{DEFAULT_VALUES.amount} {DEFAULT_VALUES.currency}</strong><small>{DEFAULT_VALUES.endToEndId}</small></div>
              </div>
              <p className="default-message-note">These sample values are used only for demonstration.</p>
            </div>
          )}


          <div className="generator-action">

            <button
              className="summary-button"
              onClick={handleGenerate}
              disabled={loading || !generatorSupported}
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
                    {selectedVersion !== result.version ? ` • requested ${selectedVersion}` : ""}

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
  </>
  );
}

export default MessageGeneratorPage;
