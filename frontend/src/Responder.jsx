import { useEffect, useState } from "react";
import "./App.css";

const API_BASE = `${window.location.protocol}//${window.location.hostname}:4000`;

function Responder() {
  const [incidents, setIncidents] = useState([]);
  const [responder, setResponder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const RESPONDER_ID = "AMB-01";

  const loadData = async () => {
    try {
      const [incidentResponse, responderResponse] =
        await Promise.all([
          fetch(`${API_BASE}/api/incidents`),
          fetch(`${API_BASE}/api/responders`),
        ]);

      const incidentData = await incidentResponse.json();
      const responderData = await responderResponse.json();

      setIncidents(incidentData);

      const currentResponder = responderData.find(
        (item) => item.id === RESPONDER_ID
      );

      setResponder(currentResponder || null);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setMessage("Unable to connect to RESQ-X backend.");
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const interval = setInterval(() => {
      loadData();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const updateIncident = async (incidentId, status) => {
    try {
      const response = await fetch(
        `${API_BASE}/api/incidents/${incidentId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status,
            assignedResponder: RESPONDER_ID,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update incident");
      }

      setMessage(
        status === "ACCEPTED"
          ? "Emergency accepted successfully."
          : "Incident marked as resolved."
      );

      loadData();
    } catch (error) {
      console.error(error);
      setMessage("Could not update incident.");
    }
  };

  const updateResponderStatus = async (status) => {
    try {
      const response = await fetch(
        `${API_BASE}/api/responders/${RESPONDER_ID}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update responder");
      }

      loadData();
    } catch (error) {
      console.error(error);
      setMessage("Could not update responder status.");
    }
  };

  const getStatusClass = (severity) => {
    if (severity === "CRITICAL") {
      return "critical";
    }

    if (severity === "HIGH") {
      return "high";
    }

    return "medium";
  };

  if (loading) {
    return (
      <div className="responder-page">
        <div className="responder-loading">
          <div className="loading-icon">🚑</div>
          <h2>RESQ-X</h2>
          <p>Connecting to emergency response network...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="responder-page">
      <header className="responder-header">
        <div>
          <div className="responder-logo">
            RESQ-X
          </div>

          <p>RESPONDER COMMAND</p>
        </div>

        <div className="responder-online">
          <span></span>
          LIVE NETWORK
        </div>
      </header>

      <main className="responder-main">

        <section className="responder-profile">
          <div className="profile-icon">
            🚑
          </div>

          <div className="profile-info">
            <small>RESPONDER UNIT</small>

            <h2>
              {responder?.name || "Ambulance Alpha"}
            </h2>

            <p>
              ID: {responder?.id || RESPONDER_ID}
            </p>
          </div>

          <div className="profile-status">
            <small>STATUS</small>

            <strong>
              {responder?.status || "AVAILABLE"}
            </strong>

            <select
              value={responder?.status || "AVAILABLE"}
              onChange={(e) =>
                updateResponderStatus(e.target.value)
              }
            >
              <option value="AVAILABLE">
                AVAILABLE
              </option>

              <option value="BUSY">
                BUSY
              </option>

              <option value="OFFLINE">
                OFFLINE
              </option>
            </select>
          </div>
        </section>

        {message && (
          <div className="responder-message">
            ✓ {message}
          </div>
        )}

        <section className="responder-title">
          <div>
            <small>HYPERLOCAL RESPONSE NETWORK</small>

            <h1>
              Active Emergency
              <span> Incidents</span>
            </h1>
          </div>

          <div className="live-indicator">
            <span></span>
            UPDATES EVERY 3 SEC
          </div>
        </section>

        {incidents.length === 0 ? (
          <div className="empty-card">
            <div>🛡️</div>

            <h2>
              No active emergencies
            </h2>

            <p>
              RESQ-X is monitoring the local
              emergency network.
            </p>
          </div>
        ) : (
          <section className="incident-list">

            {incidents.map((incident) => (

              <div
                className={`incident-card ${
                  incident.severity === "CRITICAL"
                    ? "critical-card"
                    : ""
                }`}
                key={incident.id}
              >

                <div className="incident-top">

                  <div>
                    <span
                      className={`severity-badge ${getStatusClass(
                        incident.severity
                      )}`}
                    >
                      {incident.severity}
                    </span>

                    <span className="incident-id-badge">
                      {incident.id}
                    </span>
                  </div>

                  <span className="incident-status">
                    {incident.status}
                  </span>
                </div>

                <div className="incident-info">

                  <div className="incident-icon">
                    {incident.incidentType ===
                    "FIRE EMERGENCY"
                      ? "🔥"
                      : incident.incidentType ===
                        "SECURITY EMERGENCY"
                      ? "🚔"
                      : "🚨"}
                  </div>

                  <div className="incident-details">

                    <h2>
                      {incident.incidentType}
                    </h2>

                    <p>
                      {incident.description}
                    </p>

                    <div className="incident-meta">

                      <span>
                        📍{" "}
                        {incident.latitude
                          ? `${incident.latitude.toFixed(
                              5
                            )}, ${incident.longitude.toFixed(
                              5
                            )}`
                          : "Location unavailable"}
                      </span>

                      <span>
                        🤖 AI{" "}
                        {incident.confidence}%
                      </span>

                    </div>

                  </div>
                </div>

                <div className="required-response">

                  <small>
                    REQUIRED RESPONSE
                  </small>

                  <div className="responder-tags">

                    {incident.requiredResponders?.map(
                      (item) => (
                        <span key={item}>
                          🚑 {item}
                        </span>
                      )
                    )}

                  </div>

                </div>

                <div className="incident-actions">

                  {incident.status === "SEARCHING" && (
                    <button
                      className="accept-button"
                      onClick={() =>
                        updateIncident(
                          incident.id,
                          "ACCEPTED"
                        )
                      }
                    >
                      🚑 ACCEPT EMERGENCY
                    </button>
                  )}

                  {incident.status === "ACCEPTED" && (
                    <>
                      <button
                        className="status-button"
                        onClick={() =>
                          updateIncident(
                            incident.id,
                            "EN ROUTE"
                          )
                        }
                      >
                        🚗 EN ROUTE
                      </button>

                      <button
                        className="resolve-button"
                        onClick={() =>
                          updateIncident(
                            incident.id,
                            "RESOLVED"
                          )
                        }
                      >
                        ✓ RESOLVE
                      </button>
                    </>
                  )}

                  {incident.status === "EN ROUTE" && (
                    <button
                      className="resolve-button"
                      onClick={() =>
                        updateIncident(
                          incident.id,
                          "RESOLVED"
                        )
                      }
                    >
                      ✓ MARK RESOLVED
                    </button>
                  )}

                  {incident.status === "RESOLVED" && (
                    <div className="resolved-message">
                      ✓ INCIDENT RESOLVED
                    </div>
                  )}

                </div>

              </div>

            ))}

          </section>
        )}

      </main>

      <footer className="responder-footer">
        RESQ-X • AI-POWERED HYPERLOCAL
        EMERGENCY RESPONSE
      </footer>
    </div>
  );
}

export default Responder;
