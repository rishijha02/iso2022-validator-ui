interface XmlEditorProps {
  xml: string;
  onXmlChange: (xml: string) => void;
  onValidate: () => void;
  onFormat: () => void;
  loading: boolean;
}

function XmlEditor({
  xml,
  onXmlChange,
  onValidate,
  onFormat,
  loading,
}: XmlEditorProps) {

  return (
    <div className="editor-card">

      <div className="editor-header">

  <div>
    <h2>ISO 20022 XML</h2>

    <p>
      Paste your ISO 20022 message or upload an XML file
    </p>
  </div>

  <div className="editor-actions">

    <button
      className="format-button"
      onClick={onFormat}
      disabled={!xml.trim()}
    >
      Format XML
    </button>

    <label className="upload-button">

      Upload XML

      <input
        type="file"
        accept=".xml,text/xml,application/xml"
        hidden
        onChange={(event) => {

          const file = event.target.files?.[0];

          if (!file) {
            return;
          }

          const reader = new FileReader();

          reader.onload = (e) => {

            const content = e.target?.result;

            if (typeof content === "string") {
              onXmlChange(content);
            }

          };

          reader.readAsText(file);

        }}
      />

    </label>

  </div>

</div>


      {/* XML Editor */}

      <div className="xml-editor">

        <div className="line-numbers">

          {xml.split("\n").map((_, index) => (
            <div key={index}>
              {index + 1}
            </div>
          ))}

        </div>


        <textarea
          value={xml}
          onChange={(event) =>
            onXmlChange(event.target.value)
          }
          spellCheck={false}
          placeholder="Paste your ISO 20022 XML here..."
        />

      </div>


      {/* Footer */}

      <div className="editor-footer">

        <span>
          {xml.length} characters
        </span>


        <button
          className="validate-button"
          disabled={loading || !xml.trim()}
          onClick={onValidate}
        >

          {loading
            ? "Validating..."
            : "Validate XML"}

        </button>

      </div>

    </div>
  );
}

export default XmlEditor;