cat > frontend/src/main.jsx <<'EOF'
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import Responder from "./Responder";

const path = window.location.pathname;

ReactDOM.createRoot(
  document.getElementById("root")
).render(
  <React.StrictMode>
    {path === "/responder" ? (
      <Responder />
    ) : (
      <App />
    )}
  </React.StrictMode>
);
EOF