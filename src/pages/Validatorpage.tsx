import { useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import XmlEditor from "../components/XmlEditor";
import ValidationResult from "../components/ValidationResult";
import { validateXml } from "../services/validatorService";
import { validateWithCustomXsd } from "../services/customxsdService";

import type { ValidationResponse } from "../types/validation";


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


    // NEW: Validation Profile
    const [validationProfile, setValidationProfile] =
        useState("ISO20022");


    // NEW: Custom XSD upload (only relevant when profile === "CUSTOM")
    const [customXsdFile, setCustomXsdFile] =
        useState<File | null>(null);

    const xsdInputRef = useRef<HTMLInputElement>(null);


    const navigate = useNavigate();


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
        }

        // allow re-selecting the same file later
        event.target.value = "";

    };


    const handleRemoveXsd = () => {
        setCustomXsdFile(null);
        setResult(null);
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


        setLoading(true);


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
                        xml,
                        customXsdFile
                    );

                } else {

                    console.log(
                        "Calling Standard Validation API:",
                        validationProfile
                    );

                    response = await validateXml(
                        xml,
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
     * Navigate to Message Summary page
     */
    const viewSummary = () => {

        navigate("/summary", {

            state: {
                xml: xml
            }

        });

    };


    return (

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

                    <a href="#">
                        Documentation
                    </a>


                    <Link to="/supported-messages">
                        Supported Messages
                    </Link>

                     <Link to="/xml-to-json">
                         XML to JSON
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


                {/* XML Editor */}

                <XmlEditor
                    xml={xml}
                    onXmlChange={setXml}
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


                        {/* Show summary only for valid messages */}

                        {result.valid && (

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

            </main>

        </div>

    );

}


export default ValidatorPage;
