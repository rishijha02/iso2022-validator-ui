import { BrowserRouter, Routes, Route } from "react-router-dom";

import ValidatorPage from "./pages/Validatorpage";
import MessageSummaryPage from "./pages/MessageSummaryPage";
import AboutPage from "./pages/AboutPage";
import SupportedMessagesPage from "./pages/SupportedMessagesPage";
import XmlToJsonPage from "./pages/XmlToJsonPage";
import DocumentationPage from "./pages/DocumentationPage";
import DeveloperToolsPage from "./pages/DeveloperToolsPage";
import IdentifierValidatorPage from "./pages/IdentifierValidatorPage";
import Base64ToolPage from "./pages/Base64ToolPage";
import UuidGeneratorPage from "./pages/UuidGeneratorPage";
import HexEncoderDecoderPage from "./pages/HexEncoderDecoderPage";

import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
        path="/about"
        element={<AboutPage />}
        />

        <Route
          path="/"
          element={<ValidatorPage />}
        />

        <Route
          path="/summary"
          element={<MessageSummaryPage />}
        />

        <Route
          path="/supported-messages"
          element={<SupportedMessagesPage />}
        />

      <Route
        path="/xml-to-json"
        element={<XmlToJsonPage />}
    />

    <Route
      path="/documentation"
     element={<DocumentationPage />}
      />

      <Route
      path="/developer-tools"
     element={<DeveloperToolsPage />}
      />
       <Route
          path="/developer-tools/identifier-validator"
          element={<IdentifierValidatorPage />}
        />

        <Route
          path="/developer-tools/base64"
          element={<Base64ToolPage />}
      />

      <Route
          path="/developer-tools/uuid-generator"
          element={<UuidGeneratorPage />}
      />

      <Route
      path="/developer-tools/hex-encoder-decoder"
      element={<HexEncoderDecoderPage />}
    />

      </Routes>
    </BrowserRouter>
  );
}

export default App;