import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

import XmlEditor from "../components/XmlEditor";
import ValidationResult from "../components/ValidationResult";
import { validateXml } from "../services/validatorService";

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
   * Validate XML
   */
  const handleValidate = async () => {

    if (!xml.trim()) {
      return;
    }


    setLoading(true);


    try {

      const response =
        await validateXml(xml);

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

          <a href="/supported-messages">
            Supported Messages
          </a>

          <Link to="/about">
            About
          </Link>

        </nav>

      </header>


      {/* Main Content */}

      <main className="main">

        <section className="hero">

          <h1>
            Validate ISO 20022 Messages
          </h1>


          <p>
            Validate your ISO 20022 XML against the
            corresponding message schema.
          </p>

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