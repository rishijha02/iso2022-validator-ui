import { BrowserRouter, Routes, Route } from "react-router-dom";

import ValidatorPage from "./pages/Validatorpage";
import MessageSummaryPage from "./pages/MessageSummaryPage";
import AboutPage from "./pages/AboutPage";
import SupportedMessagesPage from "./pages/SupportedMessagesPage";

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

      </Routes>
    </BrowserRouter>
  );
}

export default App;