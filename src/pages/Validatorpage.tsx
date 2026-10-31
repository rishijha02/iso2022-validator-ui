import { useRef, useState } from "react";
import SEO from "../components/SEO";
import { Link } from "react-router-dom";

import XmlEditor from "../components/XmlEditor";
import ValidationResult from "../components/ValidationResult";
import { validateXml } from "../services/validatorService";
import { validateWithCustomXsd } from "../services/customxsdService";
import { generateMessageSummary } from "../services/messageSummaryService";

import type { ValidationResponse } from "../types/validation";
import type { MessageSummaryResponse } from "../services/messageSummaryService";


const sampleXml = `
<?xml version="1.0" encoding="UTF-8"?>
<Document
  xmlns="urn:iso:std:iso:20022:tech:xsd:pacs.008.001.14">
  <FIToFICstmrCdtTrf>
    <GrpHdr>
      <MsgId>MSG-20260817-001</MsgId>
      <CreDtTm>2026-08-17T10:30:00</CreDtTm>
      <NbOfTxs>1</NbOfTxs>
    </GrpHdr>
    <CdtTrfTxInf>
      <PmtId>
        <EndToEndId>E2E-9876543210</EndToEndId>
        <UETR>c1b2c3d4-e5f6-4a8b-9c0d-1e2f3a4b5c6d</UETR>
      </PmtId>
      <IntrBkSttlmAmt Ccy="EUR">
        1250.00
      </IntrBkSttlmAmt>
    </CdtTrfTxInf>
  </FIToFICstmrCdtTrf>
</Document>
`;


const ISO_20022_NAMESPACE_PREFIX = "urn:iso:std:iso:20022:tech:xsd:";

function findCompleteXmlRootEnd(xml: string): number | null {
    const openElements: string[] = [];
    let index = 0;

    while (index < xml.length) {
        if (xml[index] !== "<") {
            index += 1;
            continue;
        }

        if (xml.startsWith("<!--", index)) {
            const commentEnd = xml.indexOf("-->", index + 4);
            if (commentEnd < 0) return null;
            index = commentEnd + 3;
            continue;
        }
        if (xml.startsWith("<![CDATA[", index)) {
            const cdataEnd = xml.indexOf("]]>", index + 9);
            if (cdataEnd < 0) return null;
            index = cdataEnd + 3;
            continue;
        }
        if (xml.startsWith("<?", index)) {
            const instructionEnd = xml.indexOf("?>", index + 2);
            if (instructionEnd < 0) return null;
            index = instructionEnd + 2;
            continue;
        }

        const isDoctype = /^<!DOCTYPE\b/i.test(xml.slice(index));
        let quote = "";
        let subsetDepth = 0;
        let end = index + 1;
        for (; end < xml.length; end += 1) {
            const character = xml[end];
            if (quote) {
                if (character === quote) quote = "";
                continue;
            }
            if (character === '"' || character === "'") {
                quote = character;
                continue;
            }
            if (isDoctype && character === "[") subsetDepth += 1;
            if (isDoctype && character === "]") subsetDepth = Math.max(0, subsetDepth - 1);
            if (character === ">" && subsetDepth === 0) break;
        }
        if (end >= xml.length) return null;

        const markup = xml.slice(index, end + 1);
        index = end + 1;
        if (markup.startsWith("<!")) continue;

        const closeMatch = markup.match(/^<\/\s*([^\s/>]+)/);
        if (closeMatch) {
            if (openElements.pop() !== closeMatch[1]) return null;
            if (openElements.length === 0) return index;
            continue;
        }

        const openMatch = markup.match(/^<\s*([^\s/>]+)/);
        if (!openMatch) return null;
        if (/\/\s*>$/.test(markup)) {
            if (openElements.length === 0) return index;
        } else {
            openElements.push(openMatch[1]);
        }
    }

    return null;
}

function extractDocumentForValidation(xml: string): { xml: string; extracted: boolean; ignoredTrailingText: boolean } {
    let inputXml = xml;
    let parsed = new DOMParser().parseFromString(inputXml, "application/xml");
    let ignoredTrailingText = false;

    if (parsed.getElementsByTagName("parsererror").length > 0) {
        const rootEnd = findCompleteXmlRootEnd(xml);
        if (rootEnd === null) return { xml, extracted: false, ignoredTrailingText: false };

        const trailingText = xml.slice(rootEnd);
        if (!trailingText.trim() || trailingText.includes("<")) {
            return { xml, extracted: false, ignoredTrailingText: false };
        }

        inputXml = xml.slice(0, rootEnd);
        parsed = new DOMParser().parseFromString(inputXml, "application/xml");
        if (parsed.getElementsByTagName("parsererror").length > 0) {
            return { xml, extracted: false, ignoredTrailingText: false };
        }
        ignoredTrailingText = true;
    }

    if (parsed.documentElement.localName === "Document") {
        return { xml: inputXml, extracted: false, ignoredTrailingText };
    }

    const documents = Array.from(parsed.getElementsByTagNameNS("*", "Document"))
        .filter((element) => element.namespaceURI?.startsWith(ISO_20022_NAMESPACE_PREFIX));

    if (documents.length !== 1) {
        return { xml: inputXml, extracted: false, ignoredTrailingText };
    }

    return {
        xml: new XMLSerializer().serializeToString(documents[0]),
        extracted: true,
        ignoredTrailingText,
    };
}

/**
 * Formats XML with indentation.
 */
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


        // Closing tag
        if (node.startsWith("</")) {

            indent = Math.max(indent - 1, 0);

        }


        formatted +=
            tab.repeat(indent) +
            node +
            "\n";


        // Opening tag that is not self-closing
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


function ValidatorPage() {

    const [xml, setXml] = useState(sampleXml);

    const [loading, setLoading] =
        useState(false);

    const [result, setResult] =
        useState<ValidationResponse | null>(null);

    const [documentWasExtracted, setDocumentWasExtracted] = useState(false);
    const [trailingTextWasIgnored, setTrailingTextWasIgnored] = useState(false);
    const [validatedXml, setValidatedXml] = useState<string | null>(null);

    const [summaryResult, setSummaryResult] =
        useState<MessageSummaryResponse | null>(null);

    const [summaryLoading, setSummaryLoading] =
        useState(false);

    const [summaryError, setSummaryError] =
        useState<string | null>(null);


    // NEW: Validation Profile
    const [validationProfile, setValidationProfile] =
        useState("ISO20022");


    // NEW: Custom XSD upload (only relevant when profile === "CUSTOM")
    const [customXsdFile, setCustomXsdFile] =
        useState<File | null>(null);

    const xsdInputRef = useRef<HTMLInputElement>(null);



    /**
     * Format XML
     */
    const handleFormatXml = () => {

        if (!xml.trim()) {
            return;
        }


        try {

            const formattedXml = formatXml(xml);

            setXml(formattedXml);

        } catch (error) {

            console.error(
                "Unable to format XML:",
                error
            );

            alert("Unable to format XML");

        }

    };


    /**
     * Triggered by the "Upload Custom XSD" link
     */
    const handleXsdButtonClick = () => {
        xsdInputRef.current?.click();
    };


    const handleXsdFileChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {

        const file = event.target.files?.[0];

        if (file) {
            setCustomXsdFile(file);
            setResult(null);
            setSummaryResult(null);
            setSummaryError(null);
        }

        // allow re-selecting the same file later
        event.target.value = "";

    };


    const handleRemoveXsd = () => {
        setCustomXsdFile(null);
        setResult(null);
        setSummaryResult(null);
        setSummaryError(null);
    };


    /**
     * Validate XML
     */
    const handleValidate = async () => {

        if (!xml.trim()) {
            return;
        }


        // Custom profile requires an uploaded XSD before validating
        if (validationProfile === "CUSTOM" && !customXsdFile) {
            alert("Upload a custom XSD file before validating.");
            return;
        }


        const { xml: validationXml, extracted, ignoredTrailingText } = extractDocumentForValidation(xml);
        setDocumentWasExtracted(extracted);
        setTrailingTextWasIgnored(ignoredTrailingText);
        setValidatedXml(validationXml);
        setLoading(true);
        setSummaryResult(null);
        setSummaryError(null);


        try {

            // const response =
            //     validationProfile === "CUSTOM" && customXsdFile
            //         ? await validateWithCustomXsd(xml, customXsdFile)
            //         : await validateXml(xml, validationProfile);

            let response: ValidationResponse;

                if (
                    validationProfile === "CUSTOM" &&
                    customXsdFile
                ) {

                    console.log("Calling Custom XSD Validation API");

                    response = await validateWithCustomXsd(
                        validationXml,
                        customXsdFile
                    );

                } else {

                    console.log(
                        "Calling Standard Validation API:",
                        validationProfile
                    );

                    response = await validateXml(
                        validationXml,
                        validationProfile
                    );

                }


            console.log(
                "Validation response:",
                response
            );


            setResult(response);

        } catch (error) {

            console.error(
                "Validation failed:",
                error
            );

            alert(
                "Unable to connect to the validation server."
            );

        } finally {

            setLoading(false);

        }

    };


    /**
     * Generate a business-friendly summary for the validated XML.
     */
    const handleGenerateSummary = async () => {

        if (!xml.trim()) {
            return;
        }

        setSummaryLoading(true);
        setSummaryError(null);

        try {
            const response = await generateMessageSummary(validatedXml ?? xml);

            if (!response.success) {
                setSummaryResult(response);
                setSummaryError(response.errorMessage || "Unable to generate message summary.");
                return;
            }

            setSummaryResult(response);

        } catch (error) {
            console.error("Unable to generate summary:", error);
            setSummaryError("Unable to generate message summary. Please try again.");

        } finally {
            setSummaryLoading(false);
        }
    };

    return (
        <>
        <SEO
        title={'ISO 20022 XML Validator | Validate ISO 20022 Messages'}
        description={'Validate ISO 20022 XML messages against schemas and identify structural and validation errors quickly. Built for payment and fintech developers.'}
        path={'/validator'}
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

                     {/* <Link to="/xml-to-json">
                         XML to JSON
                     </Link> */}

                     <Link to="/developer-tools">
                         DeveloperTools
                     </Link>


                    <Link to="/about">
                        About
                    </Link>

                </nav>

            </header>


            {/* Main Content */}

            <main className="main">


                {/* Hero Section */}

                <section className="hero">

                    <h1>
                        Validate ISO 20022 Messages
                    </h1>


                    <p>
                        Validate your ISO 20022 XML against the
                        corresponding message schema.
                    </p>

                </section>


                {/* Validation Profile Selector */}

                <section className="validation-profile-section">

  <div className="profile-label-container">

    <label htmlFor="validationProfile">
      Validation Profile
    </label>

    <span>
      Select the message standard you want to validate against
    </span>

  </div>

  <div className="profile-select-wrapper">

    <select
      id="validationProfile"
      value={validationProfile}
      onChange={(e) => {
        setValidationProfile(e.target.value);
        setResult(null);
        setSummaryResult(null);
        setSummaryError(null);
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


  {/* NEW: only shown when Custom XSD profile is selected */}

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

          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 21V9" />
            <path d="M7 14l5-5 5 5" />
            <path d="M5 3h14" />
          </svg>

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

</section>


                <div className="message-privacy-note" role="note">
                    <span aria-hidden="true">🔒</span>
                    Message XML is processed at runtime for validation and is not stored by FintechSchema.
                </div>

                {/* XML Editor */}

                <XmlEditor
                    xml={xml}
                    onXmlChange={(value) => {
                        setXml(value);
                        setResult(null);
                        setSummaryResult(null);
                        setSummaryError(null);
                        setDocumentWasExtracted(false);
                        setTrailingTextWasIgnored(false);
                        setValidatedXml(null);
                    }}
                    onValidate={handleValidate}
                    onFormat={handleFormatXml}
                    loading={loading}
                />


                {/* Validation Result */}

                {result && (

                    <>

                        <ValidationResult
                            result={result}
                        />

                        {(documentWasExtracted || trailingTextWasIgnored) && (
                            <div className="envelope-validation-note" role="status">
                                {trailingTextWasIgnored && <span>Text after the closing XML element was ignored. </span>}
                                {documentWasExtracted && <>A SWIFT-style envelope was detected. The embedded <code>Document</code> was sent for ISO 20022 validation; the wrapper and <code>AppHdr</code> were not validated.</>}
                            </div>
                        )}


                        {/* Generate summary only for valid messages */}

                        {result.valid && (
                            <div className="summary-action">
                                <button
                                    className="summary-button"
                                    onClick={handleGenerateSummary}
                                    disabled={summaryLoading}
                                >
                                    {summaryLoading
                                        ? "Generating Summary..."
                                        : summaryResult
                                            ? "Refresh Message Summary ↻"
                                            : "Generate Message Summary →"}
                                </button>
                            </div>
                        )}

                        {result.valid && summaryError && (
                            <div className="inline-summary-error">
                                {summaryError}
                            </div>
                        )}

                        {result.valid && summaryResult && summaryResult.success && (
                            <section className="inline-summary-section">
                                <div className="inline-summary-heading">
                                    <div>
                                        <span className="inline-summary-eyebrow">MESSAGE SUMMARY</span>
                                        <h2>{summaryResult.title}</h2>
                                        <p>Business-friendly details extracted from your validated XML.</p>
                                    </div>

                                    <div className="summary-badges">
                                        <span className="message-type-badge">{summaryResult.messageType}</span>
                                        <span className="version-badge">Version {summaryResult.version}</span>
                                    </div>
                                </div>

                                <div className="inline-summary-grid">
                                    {Object.entries(summaryResult.summary).map(([key, value]) => (
                                        <div key={key} className="inline-summary-item">
                                            <span className="inline-summary-label">{key}</span>
                                            <span className="inline-summary-value">{value || "—"}</span>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                    </>

                )}

            </main>

        </div>

    </>

    );

}


export default ValidatorPage;
