import SEO from "../components/SEO";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import {
  generateMessage,
  getGeneratorFields,
  getGeneratorMessageTypes,
  getGeneratorVersions
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
  MessageGenerationResponse,
  GeneratorField
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
type MessageFamily = "camt" | "pacs" | "pain";

function getMessageFamily(messageType: string): MessageFamily {
  return messageType.split(".")[0] === "camt" ? "camt" : messageType.split(".")[0] === "pain" ? "pain" : "pacs";
}

function getMessageTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    "pacs.002": "pacs.002 — Payment Status",
    "pacs.004": "pacs.004 — Payment Return",
    "pacs.008": "pacs.008 — Credit Transfer",
    "pacs.009": "pacs.009 — Financial Institution Credit Transfer",
    "pain.001": "pain.001 — Customer Credit Transfer Initiation",
    "pain.002": "pain.002 — Customer Payment Status Report",
    "pain.007": "pain.007 — Customer Payment Reversal",
    "pain.008": "pain.008 — Customer Direct Debit Initiation"
  };
  return labels[type] ?? type;
}
type IdentifierField = "debtorIban" | "debtorBic" | "creditorIban" | "creditorBic";
type IdentifierState = {
  status: "idle" | "loading" | "valid" | "invalid";
  message?: string;
};

const GENERATOR_SESSION_KEY = "fintechschema:message-generator-state";

type SavedGeneratorState = {
  generatedXml?: string;
  result?: MessageGenerationResponse | null;
  validationProfile?: string;
  validationResult?: ValidationResponse | null;
};

function readSavedGeneratorState(): SavedGeneratorState {
  try {
    const saved = sessionStorage.getItem(GENERATOR_SESSION_KEY);
    return saved ? JSON.parse(saved) as SavedGeneratorState : {};
  } catch {
    return {};
  }
}

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

function MessageGeneratorPage() {

  const navigate = useNavigate();
  const location = useLocation();

  const navigationState = location.state as {
    messageType?: string;
    version?: string;
  } | null;

  const [messageFamily, setMessageFamily] =
    useState<MessageFamily>(getMessageFamily(navigationState?.messageType ?? "pacs.008"));

  const [messageType, setMessageType] =
    useState(navigationState?.messageType ?? "pacs.008");

  const [availableMessageTypes, setAvailableMessageTypes] = useState<string[]>([]);

  const [selectedVersion, setSelectedVersion] =
    useState(navigationState?.version ?? "");

  const [generationMode, setGenerationMode] =
    useState<GenerationMode>(navigationState?.messageType ? "DEFAULT" : "CUSTOM");

  const generatorSupported = /^(pacs|camt|pain)\.\d{3}$/.test(messageType);

  const [geography, setGeography] =
    useState("ISO");

  const [supportedVersions, setSupportedVersions] = useState<string[]>([]);

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

  const [schemaFields, setSchemaFields] = useState<GeneratorField[]>([]);
  const [schemaFieldValues, setSchemaFieldValues] = useState<Record<string, string>>({});
  const [schemaLoading, setSchemaLoading] = useState(false);
  const [schemaError, setSchemaError] = useState("");

  useEffect(() => {
    let active = true;
    setAvailableMessageTypes([]);
    getGeneratorMessageTypes(messageFamily)
      .then((types) => {
        if (!active) return;
        setAvailableMessageTypes(types);
        const preferred = messageFamily === "pacs" && types.includes("pacs.008") ? "pacs.008" : types[0] ?? "";
        setMessageType((current) => types.includes(current) ? current : preferred);
        if (types.length === 0) setSchemaError(`No ${messageFamily.toUpperCase()} message schemas are bundled.`);
      })
      .catch((error: unknown) => {
        if (active) setSchemaError(error instanceof Error ? error.message : "Unable to load message types.");
      });
    return () => { active = false; };
  }, [messageFamily]);

  useEffect(() => {
    if (!generatorSupported || geography === "SEPA") {
      setSupportedVersions([]);
      setSelectedVersion("");
      setSchemaFields([]);
      setSchemaError("");
      return;
    }
    let active = true;
    setSupportedVersions([]);
    setSelectedVersion("");
    setSchemaError("");
    getGeneratorVersions(geography, messageType)
      .then((versions: string[]) => {
        if (!active) return;
        setSupportedVersions(versions);
        if (versions.length > 0) setSelectedVersion(versions[0]);
        else setSchemaError(`No ${messageType} schemas are bundled for ${geography}.`);
      })
      .catch((error: unknown) => {
        if (active) setSchemaError(error instanceof Error ? error.message : "Unable to load available schema versions.");
      });
    return () => { active = false; };
  }, [geography, generatorSupported, messageType]);

  useEffect(() => {
    if (!generatorSupported || geography === "SEPA" || supportedVersions.length === 0 || !supportedVersions.includes(selectedVersion)) {
      setSchemaFields([]);
      setSchemaLoading(false);
      return;
    }
    let active = true;
    setSchemaLoading(true);
    setSchemaError("");
    getGeneratorFields(geography, selectedVersion, messageType)
      .then((fields) => { if (active) setSchemaFields(fields); })
      .catch((error: unknown) => { if (active) { setSchemaFields([]); setSchemaError(error instanceof Error ? error.message : "Unable to load schema fields."); } })
      .finally(() => { if (active) setSchemaLoading(false); });
    return () => { active = false; };
  }, [geography, selectedVersion, generatorSupported, supportedVersions, messageType]);

  const [savedGeneratorState] = useState(readSavedGeneratorState);

  const [loading, setLoading] =
    useState(false);

  const [result, setResult] =
    useState<MessageGenerationResponse | null>(savedGeneratorState.result ?? null);

  /*
   * Validation state.
   * These are deliberately kept separate from generation state so the
   * generated XML can be edited and validated without generating again.
   */
  const [validationProfile, setValidationProfile] =
    useState(savedGeneratorState.validationProfile ?? "ISO20022");

  const [validationResult, setValidationResult] =
    useState<ValidationResponse | null>(savedGeneratorState.validationResult ?? null);

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
    useState(savedGeneratorState.generatedXml ?? "");

  useEffect(() => {
    try {
      sessionStorage.setItem(GENERATOR_SESSION_KEY, JSON.stringify({
        generatedXml,
        result,
        validationProfile,
        validationResult
      } satisfies SavedGeneratorState));
    } catch {
      // Storage may be unavailable in private browsing; the page still works normally.
    }
  }, [generatedXml, result, validationProfile, validationResult]);


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

      const inputValues: Record<string, string> = {
        debtorName, debtorIban, debtorBic, creditorName, creditorIban,
        creditorBic, amount, currency, endToEndId, ...schemaFieldValues
      };
      const missingField = schemaFields.find(
        (field) => field.required && !inputValues[field.key]?.trim()
      );
      if (schemaLoading || schemaFields.length === 0) {
        alert(`The ${messageType} schema fields have not loaded yet. Please wait and try again.`);
        return;
      }
      if (missingField) {
        alert(`${missingField.label} is required by the selected ${messageType} schema.`);
        return;
      }

      if (messageType === "pacs.008" && (
        !debtorName.trim() ||
        !debtorIban.trim() ||
        !debtorBic.trim()
      )) {
        alert("Please enter debtor details.");
        return;
      }

      if (messageType === "pacs.008" && (
        !creditorName.trim() ||
        !creditorIban.trim() ||
        !creditorBic.trim()
      )) {
        alert("Please enter creditor details.");
        return;
      }

      if (messageType === "pacs.008" && !amount.trim()) {
        alert("Please enter amount.");
        return;
      }

      if (messageType === "pacs.008" && !isCustomIdentifiersValid) {
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
            version: selectedVersion,
            fields: { ...schemaFieldValues, currency, returnAmount: schemaFieldValues.returnAmount ?? amount }
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
          xml: generatedXml,
          from: location.pathname
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

            <div className="generator-grid generator-config-grid">
              <div className="form-group">
                <label>Message Family</label>
                <select value={messageFamily} onChange={(event) => {
                  const family = event.target.value as MessageFamily;
                  setMessageFamily(family);
                  setMessageType("");
                  setSelectedVersion("");
                  setSchemaFields([]);
                  setSchemaFieldValues({});
                  setResult(null);
                  setValidationResult(null);
                }}>
                  <option value="camt">CAMT — Cash Management</option>
                  <option value="pacs">PACS — Payments Clearing and Settlement</option>
                  <option value="pain">PAIN — Payments Initiation</option>
                </select>
              </div>

              <div className="form-group">
                <label>Message Type</label>
                <select value={messageType} disabled={availableMessageTypes.length === 0} onChange={(event) => {
                  const nextType = event.target.value;
                  setMessageType(nextType);
                  setSelectedVersion("");
                  setSchemaFields([]);
                  setSchemaFieldValues({});
                  setResult(null);
                  setValidationResult(null);
                }}>
                  {!messageType && <option value="" disabled>Loading message types…</option>}
                  {availableMessageTypes.map((type) => (
                    <option key={type} value={type}>{getMessageTypeLabel(type)}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Geography / Profile</label>
                <select value={geography} onChange={(event) => {
                  const nextGeography = event.target.value;
                  setGeography(nextGeography);
                  setValidationProfile(nextGeography === "CBPR_PLUS" ? "CBPR_PLUS" : nextGeography === "SEPA" ? "SEPA" : "ISO20022");
                  setResult(null);
                  setValidationResult(null);
                }}>
                  <option value="ISO">ISO 20022</option>
                  <option value="SEPA">SEPA (schema unavailable)</option>
                  <option value="CBPR_PLUS">CBPR+</option>
                </select>
                {geography === "SEPA" && (
                  <small className="generator-support-note">
                    SEPA generation is unavailable until a SEPA schema is configured.
                  </small>
                )}
              </div>

              <div className="form-group">
                <label>Detected XSD Version</label>
                <input
                  value={selectedVersion ? `${messageType}.${selectedVersion}` : schemaError ? "Unavailable" : "Loading…"}
                  readOnly
                  aria-live="polite"
                />
              </div>
            </div>

          </div>


          {generationMode === "CUSTOM" ? (
            <>

          {schemaLoading && <div className="generator-support-note">Loading fields from the selected {messageType} schema…</div>}
          {schemaError && <div className="generator-support-note">{schemaError}</div>}
          {Object.entries(schemaFields.reduce<Record<string, GeneratorField[]>>((sections, field) => {
            (sections[field.section] ??= []).push(field);
            return sections;
          }, {})).map(([section, fields]) => (
            <div className="generator-section" key={section}>
              <h2>{section === "Payment" ? "Payment Details" : section}</h2>
              <div className="generator-grid">
                {fields.map((field) => {
                  const current: Record<string, string> = {
                    debtorName, debtorIban, debtorBic, creditorName, creditorIban,
                    creditorBic, amount, currency, endToEndId, ...schemaFieldValues
                  };
                  const setters: Record<string, (value: string) => void> = {
                    debtorName: setDebtorName, debtorIban: setDebtorIban, debtorBic: setDebtorBic,
                    creditorName: setCreditorName, creditorIban: setCreditorIban,
                    creditorBic: setCreditorBic, amount: setAmount, currency: setCurrency,
                    endToEndId: setEndToEndId
                  };
                  const updateField = (value: string) => {
                    const setter = setters[field.key];
                    if (setter) setter(value);
                    else setSchemaFieldValues((values) => ({ ...values, [field.key]: value }));
                  };
                  const input = field.inputType === "currency" ? (
                    <select value={current[field.key] ?? "EUR"} onChange={(event) => updateField(event.target.value)}>
                      {["EUR", "USD", "GBP", "CHF"].map((code) => <option key={code} value={code}>{code}</option>)}
                    </select>
                  ) : (
                    <input type={field.inputType} value={current[field.key] ?? ""} required={field.required}
                      step={field.inputType === "number" ? "0.00001" : undefined}
                      onChange={(event) => updateField(event.target.value)} placeholder={field.placeholder} />
                  );
                  return <div className="form-group" key={field.key}>
                    <label>{field.label}{field.required ? " *" : ""}</label>
                    {input}
                    <small className="generator-field-path">XSD element: {field.schemaPath}</small>
                    {field.key === "debtorIban" && getIdentifierStatus("debtorIban")}
                    {field.key === "debtorBic" && getIdentifierStatus("debtorBic")}
                    {field.key === "creditorIban" && getIdentifierStatus("creditorIban")}
                    {field.key === "creditorBic" && getIdentifierStatus("creditorBic")}
                  </div>;
                })}
              </div>
            </div>
          ))}

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

            <p className="message-privacy-note" role="note">
              <span aria-hidden="true">🔒</span>
              Generated and submitted message XML is processed at runtime for validation and is not stored by FintechSchema.
            </p>

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

                    <option value="SEPA" disabled>
                      SEPA Payments (schema unavailable)
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
