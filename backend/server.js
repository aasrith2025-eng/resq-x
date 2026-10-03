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

app.get("/", (req, res) => {
  res.json({
    message: "RESQ-X backend is running",
    status: "ONLINE"
  });
});

app.get("/api/incidents", (req, res) => {
  res.json(incidents);
});

app.get("/api/responders", (req, res) => {
  res.json(responders);
});

app.post("/api/incidents", (req, res) => {
  const incident = {
    id: `RX-${Math.floor(1000 + Math.random() * 9000)}`,
    description: req.body.description || "Emergency reported",
    incidentType: req.body.incidentType || "GENERAL EMERGENCY",
    severity: req.body.severity || "HIGH",
    confidence: req.body.confidence || 92,
    latitude: req.body.latitude || null,
    longitude: req.body.longitude || null,
    requiredResponders:
      req.body.requiredResponders || ["AMBULANCE"],
    status: "SEARCHING",
    assignedResponder: null,
    createdAt: new Date().toISOString()
  };

  incidents.unshift(incident);

  io.emit("incident-created", incident);

  res.status(201).json(incident);
});

app.patch("/api/incidents/:id", (req, res) => {
  const incident = incidents.find(
    item => item.id === req.params.id
  );

  if (!incident) {
    return res.status(404).json({
      error: "Incident not found"
    });
  }

  Object.assign(incident, req.body);

  io.emit("incident-updated", incident);

  res.json(incident);
});

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

io.on("connection", socket => {
  console.log("Device connected:", socket.id);

  socket.emit("initial-data", {
    incidents,
    responders
  });

  socket.on("disconnect", () => {
    console.log("Device disconnected:", socket.id);
  });
});

const PORT = 4000;

server.listen(PORT, "0.0.0.0", () => {
  console.log("");
  console.log("======================================");
  console.log("       RESQ-X BACKEND ONLINE");
  console.log("======================================");
  console.log(`Local:   http://localhost:${PORT}`);
  console.log(`Network: http://192.168.137.1:${PORT}`);
  console.log("======================================");
  console.log("");
});