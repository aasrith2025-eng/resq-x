const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PATCH"]
  }
});

app.use(cors());
app.use(express.json());

let incidents = [];

let responders = [
  {
    id: "AMB-01",
    name: "Ambulance Alpha",
    type: "AMBULANCE",
    status: "AVAILABLE",
    distance: 1.2
  },
  {
    id: "MED-01",
    name: "Medical Responder One",
    type: "MEDICAL",
    status: "AVAILABLE",
    distance: 0.6
  },
  {
    id: "POL-01",
    name: "Police Unit One",
    type: "POLICE",
    status: "AVAILABLE",
    distance: 1.8
  }
];

/* ================================
   HEALTH CHECK
================================ */

app.get("/", (req, res) => {
  res.json({
    message: "RESQ-X backend is running",
    status: "ONLINE"
  });
});

/* ================================
   GET INCIDENTS
================================ */

app.get("/api/incidents", (req, res) => {
  res.json(incidents);
});

/* ================================
   GET RESPONDERS
================================ */

app.get("/api/responders", (req, res) => {
  res.json(responders);
});

/* ================================
   CREATE INCIDENT
================================ */

app.post("/api/incidents", (req, res) => {
  const now = new Date().toISOString();

  const incident = {
    id: `RX-${Math.floor(1000 + Math.random() * 9000)}`,

    description:
      req.body.description || "Emergency reported",

    incidentType:
      req.body.incidentType || "GENERAL EMERGENCY",

    severity:
      req.body.severity || "HIGH",

    confidence:
      req.body.confidence || 92,

    latitude:
      req.body.latitude || null,

    longitude:
      req.body.longitude || null,

    requiredResponders:
      req.body.requiredResponders || ["AMBULANCE"],

    status: "SEARCHING",

    assignedResponder: null,

    /* Response-time tracking */
    createdAt: now,
    acceptedAt: null,
    enRouteAt: null,
    resolvedAt: null,

    responseTimeSeconds: null
  };

  incidents.unshift(incident);

  console.log(
    `[INCIDENT CREATED] ${incident.id} - ${incident.incidentType}`
  );

  io.emit("incident-created", incident);

  res.status(201).json(incident);
});

/* ================================
   UPDATE INCIDENT
================================ */

app.patch("/api/incidents/:id", (req, res) => {
  const incident = incidents.find(
    item => item.id === req.params.id
  );

  if (!incident) {
    return res.status(404).json({
      error: "Incident not found"
    });
  }

  const newStatus = req.body.status;

  /*
    ACCEPTED
    Record the exact time the responder accepts.
  */
  if (
    newStatus === "ACCEPTED" &&
    incident.status !== "ACCEPTED"
  ) {
    incident.acceptedAt = new Date().toISOString();

    console.log(
      `[RESPONDER ACCEPTED] ${incident.id}`
    );
  }

  /*
    EN ROUTE
    Record when responder starts travelling.
  */
  if (
    newStatus === "EN ROUTE" &&
    incident.status !== "EN ROUTE"
  ) {
    incident.enRouteAt = new Date().toISOString();

    console.log(
      `[RESPONDER EN ROUTE] ${incident.id}`
    );
  }

  /*
    RESOLVED
    Calculate total response time from
    incident creation to resolution.
  */
  if (
    newStatus === "RESOLVED" &&
    incident.status !== "RESOLVED"
  ) {
    incident.resolvedAt = new Date().toISOString();

    const createdTime = new Date(
      incident.createdAt
    ).getTime();

    const resolvedTime = new Date(
      incident.resolvedAt
    ).getTime();

    incident.responseTimeSeconds = Math.max(
      0,
      Math.round(
        (resolvedTime - createdTime) / 1000
      )
    );

    console.log(
      `[INCIDENT RESOLVED] ${incident.id} - Response time: ${incident.responseTimeSeconds}s`
    );
  }

  /*
    Apply the remaining fields sent by the frontend.
  */
  Object.assign(incident, req.body);

  /*
    Restore calculated timestamps if Object.assign
    contained conflicting values.
  */
  if (newStatus === "ACCEPTED") {
    incident.acceptedAt =
      incident.acceptedAt || new Date().toISOString();
  }

  io.emit("incident-updated", incident);

  res.json(incident);
});

/* ================================
   UPDATE RESPONDER
================================ */

app.patch("/api/responders/:id", (req, res) => {
  const responder = responders.find(
    item => item.id === req.params.id
  );

  if (!responder) {
    return res.status(404).json({
      error: "Responder not found"
    });
  }

  Object.assign(responder, req.body);

  io.emit("responder-updated", responder);

  res.json(responder);
});

/* ================================
   SOCKET.IO
================================ */

io.on("connection", socket => {
  console.log(
    "Device connected:",
    socket.id
  );

  socket.emit("initial-data", {
    incidents,
    responders
  });

  socket.on("disconnect", () => {
    console.log(
      "Device disconnected:",
      socket.id
    );
  });
});

/* ================================
   START SERVER
================================ */

const PORT = 4000;

server.listen(PORT, "0.0.0.0", () => {
  console.log("");
  console.log("======================================");
  console.log("       RESQ-X BACKEND ONLINE");
  console.log("======================================");
  console.log(`Local:   http://localhost:${PORT}`);
  console.log(`Network: http://192.168.137.1:${PORT}`);
  console.log("");
  console.log("Response-time tracking: ENABLED");
  console.log("======================================");
  console.log("");
});