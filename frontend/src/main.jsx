import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import Responder from "./Responder";
import Admin from "./Admin";

const path = window.location.pathname.replace(/\/+$/, "") || "/";

ReactDOM.createRoot(
  document.getElementById("root")
).render(
  <React.StrictMode>
    {path === "/responder" ? (
      <Responder />
    ) : path === "/admin" ? (
      <Admin />
    ) : (
      <App />
    )}
  </React.StrictMode>
);