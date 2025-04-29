import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import App1 from "./App1.jsx";
import App2 from "./App2.jsx";
import App3 from "./App3.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
    <App1/>
    {/* <App2/> */}
    <App3 />
  </StrictMode>
);
