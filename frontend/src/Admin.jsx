import { useEffect, useState } from "react";
import "./App.css";
import "./Admin.css";

const API_BASE = `${window.location.protocol}//${window.location.hostname}:4000`;

function Admin() {
  const [incidents, setIncidents] = useState([]);
  const [responders, setResponders] = useState([]);
  const [loading, setLoading] = useState(true);

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
      setResponders(responderData);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const interval = setInterval(loadData, 3000);

    return () => clearInterval(interval);
  }, []);

  const activeIncidents = incidents.filter(
    (incident) => incident.status !== "RESOLVED"
  );

  const resolvedIncidents = incidents.filter(
    (incident) => incident.status === "RESOLVED"
  );

  const criticalIncidents = activeIncidents.filter(
    (incident) => incident.severity === "CRITICAL"
  );

  const getSeverityClass = (severity) => {
    if (severity === "CRITICAL") return "critical";
    if (severity === "HIGH") return "high";
    return "medium";
  };

  const getIncidentIcon = (type) => {
    if (type === "FIRE EMERGENCY") return "🔥";
    if (type === "SECURITY EMERGENCY") return "🚔";
    return "🚨";
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-loading">
          <div className="loading-icon">🛰️</div>
          <h2>RESQ-X</h2>
          <p>Connecting to command center...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">

      <header className="admin-header">

        <div>
          <div className="admin-logo">
            RESQ-X
          </div>

          <p>
            EMERGENCY COMMAND CENTER
          </p>
        </div>

        <div className="admin-live">
          <span></span>
          LIVE NETWORK
        </div>

      </header>

      <main className="admin-main">

        <section className="admin-hero">

          <div>
            <small>
              HYPERLOCAL EMERGENCY RESPONSE
            </small>

            <h1>
              Command
              <span> Center</span>
            </h1>

            <p>
              Monitor incidents, coordinate responders,
              and track emergency resolution in real time.
            </p>
          </div>

          <div className="command-status">
            <span></span>
            SYSTEM OPERATIONAL
          </div>

        </section>

        <section className="admin-stats">

          <div className="stat-card">
            <div className="stat-icon">🚨</div>

            <div>
              <small>ACTIVE INCIDENTS</small>
              <strong>{activeIncidents.length}</strong>
            </div>
          </div>

          <div className="stat-card critical-stat">
            <div className="stat-icon">⚠️</div>

            <div>
              <small>CRITICAL</small>
              <strong>{criticalIncidents.length}</strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🚑</div>

            <div>
              <small>RESPONDERS</small>
              <strong>{responders.length}</strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">✓</div>

            <div>
              <small>RESOLVED</small>
              <strong>{resolvedIncidents.length}</strong>
            </div>
          </div>

        </section>

        <section className="admin-section-header">

          <div>
            <small>REAL-TIME MONITORING</small>

            <h2>
              Active Emergency Incidents
            </h2>
          </div>

          <div className="refresh-status">
            ● AUTO REFRESH 3 SEC
          </div>

        </section>

        {activeIncidents.length === 0 ? (

          <div className="admin-empty">
            <div>🛡️</div>

            <h2>
              No active emergencies
            </h2>

            <p>
              RESQ-X is monitoring the local emergency network.
            </p>
          </div>

        ) : (

          <section className="admin-incidents">

            {activeIncidents.map((incident) => (

              <article
                className={`admin-incident ${
                  incident.severity === "CRITICAL"
                    ? "admin-critical"
                    : ""
                }`}
                key={incident.id}
              >

                <div className="admin-incident-header">

                  <div>

                    <span
                      className={`severity-badge ${getSeverityClass(
                        incident.severity
                      )}`}
                    >
                      {incident.severity}
                    </span>

                    <span className="incident-id-badge">
                      {incident.id}
                    </span>

                  </div>

                  <span className="admin-incident-status">
                    {incident.status}
                  </span>

                </div>

                <div className="admin-incident-body">

                  <div className="admin-incident-icon">
                    {getIncidentIcon(incident.incidentType)}
                  </div>

                  <div className="admin-incident-details">

                    <h3>
                      {incident.incidentType}
                    </h3>

                    <p>
                      {incident.description}
                    </p>

                    <div className="admin-meta">

                      <span>
                        📍{" "}
                        {incident.latitude
                          ? `${Number(
                              incident.latitude
                            ).toFixed(5)}, ${Number(
                              incident.longitude
                            ).toFixed(5)}`
                          : "Location unavailable"}
                      </span>

                      <span>
                        🤖 AI {incident.confidence}%
                      </span>

                      <span>
                        🕐{" "}
                        {new Date(
                          incident.createdAt
                        ).toLocaleTimeString()}
                      </span>

                    </div>

                  </div>

                </div>

                <div className="admin-response">

                  <div>

                    <small>
                      REQUIRED RESPONSE
                    </small>

                    <div className="admin-tags">

                      {incident.requiredResponders?.map(
                        (item) => (
                          <span key={item}>
                            🚑 {item}
                          </span>
                        )
                      )}

                    </div>

                  </div>

                  <div className="assignment">

                    <small>
                      ASSIGNED UNIT
                    </small>

                    <strong>
                      {incident.assignedResponder ||
                        "SEARCHING..."}
                    </strong>

                  </div>

                </div>

                <div className="admin-progress">

                  <div className="progress-label">
                    <span>RESPONSE STATUS</span>

                    <strong>
                      {incident.status}
                    </strong>
                  </div>

                  <div className="progress-track">

                    <div
                      className={`progress-fill ${
                        incident.status === "RESOLVED"
                          ? "resolved"
                          : incident.status === "EN ROUTE"
                          ? "enroute"
                          : "searching"
                      }`}
                      style={{
                        width:
                          incident.status === "RESOLVED"
                            ? "100%"
                            : incident.status === "EN ROUTE"
                            ? "75%"
                            : incident.status === "ACCEPTED"
                            ? "45%"
                            : "20%",
                      }}
                    ></div>

                  </div>

                  <div className="progress-steps">

                    <span className="active-step">
                      REPORTED
                    </span>

                    <span>
                      MATCHED
                    </span>

                    <span>
                      EN ROUTE
                    </span>

                    <span>
                      RESOLVED
                    </span>

                  </div>

                </div>

              </article>

            ))}

          </section>

        )}

        <section className="responder-network">

          <div className="admin-section-header">

            <div>
              <small>RESPONSE NETWORK</small>

              <h2>
                Responder Units
              </h2>
            </div>

            <div className="refresh-status">
              {responders.length} UNITS CONNECTED
            </div>

          </div>

          <div className="responder-grid">

            {responders.map((responder) => (

              <div
                className="network-card"
                key={responder.id}
              >

                <div className="network-icon">
                  {responder.type === "POLICE"
                    ? "🚔"
                    : responder.type === "MEDICAL"
                    ? "🏥"
                    : "🚑"}
                </div>

                <div className="network-info">

                  <h3>
                    {responder.name}
                  </h3>

                  <p>
                    {responder.id}
                  </p>

                  <span
                    className={`unit-status ${
                      responder.status === "AVAILABLE"
                        ? "unit-available"
                        : "unit-busy"
                    }`}
                  >
                    ● {responder.status}
                  </span>

                </div>

                <div className="unit-distance">
                  <small>DISTANCE</small>
                  <strong>
                    {responder.distance} km
                  </strong>
                </div>

              </div>

            ))}

          </div>

        </section>

      </main>

      <footer className="admin-footer">
        RESQ-X • AI-POWERED HYPERLOCAL
        EMERGENCY RESPONSE
      </footer>

    </div>
  );
}

export default Admin;
