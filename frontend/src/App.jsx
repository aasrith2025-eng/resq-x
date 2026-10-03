import { useState, useEffect } from "react";
import "./App.css";

// Automatically uses the same computer/network that is serving the frontend.
// Example:
// Frontend: http://192.168.137.1:5173
// Backend:  http://192.168.137.1:4000
const API_BASE = `${window.location.protocol}//${window.location.hostname}:4000`;

function App() {
  const [showReport, setShowReport] = useState(false);

  const [location, setLocation] = useState(null);

  const [locationStatus, setLocationStatus] = useState(
    "Getting your location..."
  );

  const [description, setDescription] = useState("");

  const [reportSubmitted, setReportSubmitted] = useState(false);

  const [incident, setIncident] = useState(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [backendStatus, setBackendStatus] = useState("CHECKING");

  const [errorMessage, setErrorMessage] = useState("");

  // Demo location for hackathon testing
  const DEMO_LOCATION = {
    latitude: 17.4485,
    longitude: 78.3908,
    demo: true,
  };

  useEffect(() => {
    getLocation();
    checkBackend();
  }, []);

  // --------------------------------------------------
  // GET LOCATION
  // --------------------------------------------------

  const getLocation = () => {
    if (!navigator.geolocation) {
      setLocation(DEMO_LOCATION);
      setLocationStatus("Demo location active");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          demo: false,
        });

        setLocationStatus("Location detected");
      },
      () => {
        // GPS denied/unavailable -> use demo location
        setLocation(DEMO_LOCATION);
        setLocationStatus("Demo location active");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // --------------------------------------------------
  // CHECK BACKEND
  // --------------------------------------------------

  const checkBackend = async () => {
    try {
      const response = await fetch(API_BASE);

      if (!response.ok) {
        throw new Error("Backend unavailable");
      }

      const data = await response.json();

      if (data.status === "ONLINE") {
        setBackendStatus("ONLINE");
      } else {
        setBackendStatus("OFFLINE");
      }
    } catch (error) {
      console.error("Backend connection error:", error);
      setBackendStatus("OFFLINE");
    }
  };

  // --------------------------------------------------
  // DEMO AI CLASSIFICATION
  // --------------------------------------------------

  const classifyEmergency = (text) => {
    let incidentType = "GENERAL EMERGENCY";
    let severity = "MEDIUM";
    let confidence = 82;
    let requiredResponders = ["EMERGENCY RESPONDER"];

    // ROAD ACCIDENT
    if (
      text.includes("accident") ||
      text.includes("bike") ||
      text.includes("car") ||
      text.includes("crash") ||
      text.includes("collision")
    ) {
      incidentType = "ROAD ACCIDENT";

      requiredResponders = [
        "AMBULANCE",
        "MEDICAL RESPONDER",
      ];
    }

    // FIRE
    if (
      text.includes("fire") ||
      text.includes("burning") ||
      text.includes("smoke")
    ) {
      incidentType = "FIRE EMERGENCY";

      requiredResponders = [
        "FIRE RESPONSE",
        "AMBULANCE",
      ];
    }

    // POLICE / SECURITY
    if (
      text.includes("robbery") ||
      text.includes("theft") ||
      text.includes("fight") ||
      text.includes("attack") ||
      text.includes("danger")
    ) {
      incidentType = "SECURITY EMERGENCY";

      requiredResponders = [
        "POLICE",
        "EMERGENCY RESPONDER",
      ];
    }

    // CRITICAL
    if (
      text.includes("unconscious") ||
      text.includes("unresponsive") ||
      text.includes("not responding") ||
      text.includes("heavy bleeding") ||
      text.includes("severe bleeding")
    ) {
      severity = "CRITICAL";
      confidence = 96;
    }

    // HIGH
    else if (
      text.includes("injured") ||
      text.includes("bleeding") ||
      text.includes("hurt") ||
      text.includes("burn")
    ) {
      severity = "HIGH";
      confidence = 91;
    }

    // GENERAL CRITICAL
    if (
      incidentType === "GENERAL EMERGENCY" &&
      severity === "CRITICAL"
    ) {
      requiredResponders = [
        "AMBULANCE",
        "MEDICAL RESPONDER",
      ];
    }

    return {
      incidentType,
      severity,
      confidence,
      requiredResponders,
    };
  };

  // --------------------------------------------------
  // CREATE INCIDENT IN BACKEND
  // --------------------------------------------------

  const analyzeEmergency = async () => {
    if (!description.trim()) {
      alert("Please describe the emergency first.");
      return;
    }

    if (!location) {
      alert("Waiting for location. Please try again.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    const text = description.toLowerCase();

    const classification = classifyEmergency(text);

    const incidentData = {
      description: description.trim(),

      incidentType: classification.incidentType,

      severity: classification.severity,

      confidence: classification.confidence,

      latitude: location.latitude,

      longitude: location.longitude,

      requiredResponders:
        classification.requiredResponders,
    };

    try {
      console.log("Sending incident to:", API_BASE);

      const response = await fetch(
        `${API_BASE}/api/incidents`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify(incidentData),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Backend returned ${response.status}`
        );
      }

      const savedIncident = await response.json();

      console.log("Incident created:", savedIncident);

      // Convert backend response into frontend format
      const newIncident = {
        id: savedIncident.id,

        type: savedIncident.incidentType,

        severity: savedIncident.severity,

        confidence: savedIncident.confidence,

        description: savedIncident.description,

        location: {
          latitude: savedIncident.latitude,

          longitude: savedIncident.longitude,
        },

        responders:
          savedIncident.requiredResponders,

        status: savedIncident.status,
      };

      setIncident(newIncident);

      setReportSubmitted(true);

      setBackendStatus("ONLINE");
    } catch (error) {
      console.error("Failed to create incident:", error);

      setBackendStatus("OFFLINE");

      setErrorMessage(
        "Unable to connect to RESQ-X backend. Make sure the backend server is running."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // --------------------------------------------------
  // CLOSE REPORT
  // --------------------------------------------------

  const closeReport = () => {
    setShowReport(false);
    setReportSubmitted(false);
    setIncident(null);
    setDescription("");
    setErrorMessage("");
  };

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <div className="app">

      {/* HEADER */}

      <header className="header">

        <div>
          <h1>RESQ-X</h1>

          <p>
            Hyperlocal Emergency Response
          </p>
        </div>

        <div className="status">

          <span></span>

          SYSTEM{" "}
          {backendStatus === "ONLINE"
            ? "ONLINE"
            : backendStatus === "CHECKING"
            ? "CONNECTING"
            : "OFFLINE"}

        </div>

      </header>

      {/* MAIN */}

      <main>

        {/* HERO */}

        <section className="hero">

          <p className="welcome">
            EMERGENCY RESPONSE NETWORK
          </p>

          <h2>
            Get help when
            <br />

            <span>
              every second matters.
            </span>
          </h2>

          <p className="description">

            Report an emergency. RESQ-X
            identifies the situation, finds
            nearby responders and coordinates
            the response.

          </p>

          <button
            className="sos-button"

            onClick={() => {

              setShowReport(true);

              setErrorMessage("");

              getLocation();

            }}
          >

            <span>🚨</span>

            <div>

              <strong>
                SOS
              </strong>

              <small>
                REPORT EMERGENCY
              </small>

            </div>

          </button>

        </section>

        {/* LOCATION */}

        <section className="location-card">

          <div className="location-icon">
            📍
          </div>

          <div>

            <small>
              YOUR LOCATION
            </small>

            <h3>
              {locationStatus}
            </h3>

            {location ? (

              <p>

                GPS:{" "}
                {location.latitude.toFixed(6)}
                {", "}
                {location.longitude.toFixed(6)}

              </p>

            ) : (

              <p>
                Waiting for location...
              </p>

            )}

          </div>

          <div className="gps-status">

            {location
              ? location.demo
                ? "● DEMO LOCATION"
                : "● GPS ACTIVE"
              : "● SEARCHING"}

          </div>

        </section>

        {/* FEATURES */}

        <section className="features">

          <div className="feature-card">

            <div>🤖</div>

            <h3>
              AI Classification
            </h3>

            <p>
              Understands emergency type
              and priority.
            </p>

          </div>

          <div className="feature-card">

            <div>🚑</div>

            <h3>
              Nearby Responders
            </h3>

            <p>
              Finds suitable available
              responders nearby.
            </p>

          </div>

          <div className="feature-card">

            <div>📡</div>

            <h3>
              Live Tracking
            </h3>

            <p>
              Track the response from
              dispatch to resolution.
            </p>

          </div>

        </section>

        {/* EMERGENCY REPORT */}

        {showReport && (

          <div className="overlay">

            <div className="report-box">

              {!reportSubmitted ? (

                <>

                  <button
                    className="close"

                    onClick={() =>
                      setShowReport(false)
                    }
                  >
                    ×
                  </button>

                  <h2>
                    🚨 Report Emergency
                  </h2>

                  <p>
                    Describe what is happening.
                    RESQ-X will analyze the
                    emergency and identify
                    suitable responders.
                  </p>

                  <textarea

                    value={description}

                    onChange={(e) =>
                      setDescription(
                        e.target.value
                      )
                    }

                    placeholder="Example: Bike accident near university gate. One person is unconscious and bleeding..."

                  />

                  <div className="modal-location">

                    <strong>
                      📍 Emergency Location
                    </strong>

                    {location ? (

                      <>

                        <p>

                          Latitude:{" "}
                          {location.latitude.toFixed(
                            6
                          )}

                          <br />

                          Longitude:{" "}
                          {location.longitude.toFixed(
                            6
                          )}

                        </p>

                        {location.demo && (

                          <small className="demo-warning">

                            Demo location used
                            because GPS permission
                            is unavailable.

                          </small>

                        )}

                      </>

                    ) : (

                      <p>
                        Getting location...
                      </p>

                    )}

                  </div>

                  {/* ERROR */}

                  {errorMessage && (

                    <div
                      style={{
                        background: "#3a1116",
                        border:
                          "1px solid #d92738",
                        color: "#ff7b86",
                        padding: "12px",
                        borderRadius: "8px",
                        marginBottom: "15px",
                        fontSize: "12px",
                      }}
                    >
                      {errorMessage}
                    </div>

                  )}

                  <button

                    className="submit-button"

                    onClick={analyzeEmergency}

                    disabled={isSubmitting}

                  >

                    {isSubmitting
                      ? "⏳ SENDING TO RESQ-X..."
                      : "🤖 ANALYZE & REPORT"}

                  </button>

                </>

              ) : (

                <>

                  <div className="success-icon">
                    🚨
                  </div>

                  <h2>
                    Emergency Analyzed
                  </h2>

                  <div className="incident-id">

                    INCIDENT{" "}
                    {incident?.id}

                  </div>

                  <div className="ai-result">

                    <div>

                      <small>
                        INCIDENT TYPE
                      </small>

                      <strong>
                        {incident?.type}
                      </strong>

                    </div>

                    <div>

                      <small>
                        SEVERITY
                      </small>

                      <strong className="critical">

                        {incident?.severity}

                      </strong>

                    </div>

                    <div>

                      <small>
                        AI CONFIDENCE
                      </small>

                      <strong>

                        {incident?.confidence}%

                      </strong>

                    </div>

                  </div>

                  <div className="response-box">

                    <small>
                      REQUIRED RESPONSE
                    </small>

                    {incident?.responders?.map(
                      (responder) => (

                        <div
                          className="responder-item"
                          key={responder}
                        >

                          🚑 {responder}

                        </div>

                      )
                    )}

                  </div>

                  <div className="tracking-box">

                    <span className="pulse"></span>

                    <div>

                      <strong>
                        INCIDENT SENT TO RESPONSE NETWORK
                      </strong>

                      <small>

                        RESQ-X has registered the
                        emergency and is matching
                        available responders.

                      </small>

                    </div>

                  </div>

                  <button
                    className="submit-button"

                    onClick={closeReport}
                  >

                    ✓ CLOSE INCIDENT VIEW

                  </button>

                </>

              )}

            </div>

          </div>

        )}

      </main>

      {/* FOOTER */}

      <footer>

        RESQ-X • AI-POWERED
        HYPERLOCAL EMERGENCY RESPONSE

      </footer>

    </div>
  );
}

export default App;