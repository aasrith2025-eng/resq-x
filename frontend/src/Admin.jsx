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

  const resolvedWithTime = resolvedIncidents.filter(
    (incident) =>
      typeof incident.responseTimeSeconds === "number"
  );

  const totalResponseTime = resolvedWithTime.reduce(
    (total, incident) =>
      total + incident.responseTimeSeconds,
    0
  );

  const averageResponseTime =
    resolvedWithTime.length > 0
      ? Math.round(
          totalResponseTime / resolvedWithTime.length
        )
      : 0;

  const fastestResponse =
    resolvedWithTime.length > 0
      ? Math.min(
          ...resolvedWithTime.map(
            (incident) =>
              incident.responseTimeSeconds
          )
        )
      : 0;

  const formatDuration = (seconds) => {
    if (
      seconds === null ||
      seconds === undefined
    ) {
      return "—";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (minutes === 0) {
      return `${remainingSeconds}s`;
    }

    return `${minutes}m ${remainingSeconds}s`;
  };

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

          <p className="admin-subtitle">
            EMERGENCY COMMAND CENTER
          </p>
        </div>

        <div className="admin-live">
          <span></span>
          LIVE NETWORK
        </div>
      </header>

      <main className="admin-main">

        {/* ================================
            COMMAND CENTER
        ================================= */}

        <section className="admin-title-row">
          <div>
            <small>HYPERLOCAL EMERGENCY RESPONSE</small>

            <h1>
              Command <span>Center</span>
            </h1>
          </div>

          <div className="admin-refresh">
            ● SYSTEM OPERATIONAL
          </div>
        </section>

        {/* ================================
            MAIN STATS
        ================================= */}

        <section className="admin-stats">

          <div className="admin-stat-card">
            <div className="admin-stat-icon">🚨</div>

            <small>ACTIVE INCIDENTS</small>

            <strong>
              {activeIncidents.length}
            </strong>
          </div>

          <div className="admin-stat-card stat-danger">
            <div className="admin-stat-icon">⚠️</div>

            <small>CRITICAL</small>

            <strong>
              {criticalIncidents.length}
            </strong>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-icon">🚑</div>

            <small>RESPONDERS</small>

            <strong>
              {responders.length}
            </strong>
          </div>

          <div className="admin-stat-card stat-success">
            <div className="admin-stat-icon">✓</div>

            <small>RESOLVED</small>

            <strong>
              {resolvedIncidents.length}
            </strong>
          </div>

        </section>

        {/* ================================
            RESPONSE TIME INTELLIGENCE
        ================================= */}

        <section
          className="response-analytics"
          style={{
            display: "block",
            visibility: "visible",
            opacity: 1,
          }}
        >

          <div className="analytics-header">

            <div>
              <small>
                PERFORMANCE ANALYTICS
              </small>

              <h2>
                Response Time <span>Intelligence</span>
              </h2>

              <p
                style={{
                  marginTop: "8px",
                  color: "#8b95a5",
                  fontSize: "12px",
                }}
              >
                Measuring how quickly RESQ-X responds
                to emergency incidents.
              </p>
            </div>

            <div className="analytics-live">
              ● LIVE METRICS
            </div>

          </div>

          <div className="analytics-grid">

            <div className="analytics-card">

              <div className="analytics-icon">
                ⏱️
              </div>

              <div>
                <small>
                  AVERAGE RESPONSE TIME
                </small>

                <strong>
                  {formatDuration(
                    averageResponseTime
                  )}
                </strong>

                <p>
                  Across resolved incidents
                </p>
              </div>

            </div>

            <div className="analytics-card">

              <div className="analytics-icon">
                ⚡
              </div>

              <div>
                <small>
                  FASTEST RESPONSE
                </small>

                <strong>
                  {formatDuration(
                    fastestResponse
                  )}
                </strong>

                <p>
                  Best recorded response
                </p>
              </div>

            </div>

            <div className="analytics-card">

              <div className="analytics-icon">
                📊
              </div>

              <div>
                <small>
                  INCIDENTS MEASURED
                </small>

                <strong>
                  {resolvedWithTime.length}
                </strong>

                <p>
                  With complete timestamps
                </p>
              </div>

            </div>

          </div>

          {/* RESPONSE HISTORY */}

          {resolvedWithTime.length > 0 && (
            <div className="response-history">

              <div className="history-title">

                <div>
                  <small>
                    RESPONSE HISTORY
                  </small>

                  <h3>
                    Recently Resolved Incidents
                  </h3>
                </div>

                <span>
                  {resolvedWithTime.length} TRACKED
                </span>

              </div>

              <div className="history-list">

                {resolvedWithTime
                  .slice(0, 5)
                  .map((incident) => (

                    <div
                      className="history-row"
                      key={incident.id}
                    >

                      <div className="history-incident">

                        <span className="history-icon">
                          {getIncidentIcon(
                            incident.incidentType
                          )}
                        </span>

                        <div>
                          <strong>
                            {incident.incidentType}
                          </strong>

                          <small>
                            {incident.id}
                          </small>
                        </div>

                      </div>

                      <div className="history-status">
                        <span>
                          ✓ RESOLVED
                        </span>
                      </div>

                      <div className="history-time">

                        <small>
                          RESPONSE TIME
                        </small>

                        <strong>
                          {formatDuration(
                            incident.responseTimeSeconds
                          )}
                        </strong>

                      </div>

                    </div>

                  ))}

              </div>

            </div>
          )}

        </section>

        {/* ================================
            ACTIVE INCIDENTS
        ================================= */}

        <section className="admin-title-row">

          <div>
            <small>
              REAL-TIME MONITORING
            </small>

            <h1>
              Active Emergency Incidents
            </h1>
          </div>

          <div className="admin-refresh">
            ● AUTO REFRESH 3 SEC
          </div>

        </section>

        {activeIncidents.length === 0 ? (

          <div className="admin-empty">

            <div className="admin-empty-icon">
              🛡️
            </div>

            <h3>
              No active emergencies
            </h3>

            <p>
              RESQ-X is monitoring the local emergency
              network.
            </p>

          </div>

        ) : (

          <section className="admin-incident-list">

            {activeIncidents.map((incident) => (

              <article
                className="admin-incident"
                key={incident.id}
              >

                <div className="admin-incident-top">

                  <div className="admin-incident-left">

                    <span
                      className={`admin-badge ${
                        incident.severity === "CRITICAL"
                          ? "admin-badge-critical"
                          : incident.severity === "HIGH"
                          ? "admin-badge-high"
                          : "admin-badge-medium"
                      }`}
                    >
                      {incident.severity}
                    </span>

                    <span className="admin-incident-id">
                      {incident.id}
                    </span>

                  </div>

                  <span className="admin-status">
                    {incident.status}
                  </span>

                </div>

                <h3>
                  {getIncidentIcon(
                    incident.incidentType
                  )}{" "}
                  {incident.incidentType}
                </h3>

                <p>
                  {incident.description}
                </p>

                <div className="admin-incident-meta">

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

                <div className="admin-incident-meta">

                  <span>
                    🚑 Required:{" "}
                    {incident.requiredResponders?.join(
                      ", "
                    )}
                  </span>

                  <span>
                    👮 Assigned:{" "}
                    {incident.assignedResponder ||
                      "SEARCHING..."}
                  </span>

                </div>

              </article>

            ))}

          </section>
        )}

        {/* ================================
            RESPONDER NETWORK
        ================================= */}

        <section className="admin-title-row">

          <div>
            <small>
              RESPONSE NETWORK
            </small>

            <h1>
              Responder Units
            </h1>
          </div>

          <div className="admin-refresh">
            {responders.length} UNITS CONNECTED
          </div>

        </section>

        <section className="admin-responder-list">

          {responders.map((responder) => (

            <div
              className="admin-responder"
              key={responder.id}
            >

              <div className="admin-responder-icon">

                {responder.type === "POLICE"
                  ? "🚔"
                  : responder.type === "MEDICAL"
                  ? "🏥"
                  : "🚑"}

              </div>

              <div className="admin-responder-info">

                <strong>
                  {responder.name}
                </strong>

                <small>
                  {responder.id} • {responder.type}
                </small>

              </div>

              <div className="admin-responder-status">

                <strong
                  className={
                    responder.status === "AVAILABLE"
                      ? "status-available"
                      : responder.status === "BUSY"
                      ? "status-busy"
                      : "status-offline"
                  }
                >
                  ● {responder.status}
                </strong>

                <small>
                  {responder.distance} km
                </small>

              </div>

            </div>

          ))}

        </section>

      </main>

      <footer className="admin-footer">
        RESQ-X • AI-POWERED HYPERLOCAL EMERGENCY RESPONSE
      </footer>

    </div>
  );
}

export default Admin;