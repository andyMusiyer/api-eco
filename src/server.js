// server.js
import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 3000;

// --- Logs en mémoire ---
const logs = [];

// --- Helper ---
async function callExternalAPI(url, routeName) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Erreur API externe: ${res.status}`);
    const data = await res.json();
    logs.push({ route: routeName, status: "success", time: new Date() });
    return data;
  } catch (err) {
    logs.push({ route: routeName, status: "error", time: new Date() });
    return { error: true, message: err.message };
  }
}

// --- Routes ---
app.get("/weather", async (req, res) => {
  const { lat = "-4.325", lon = "15.322" } = req.query;
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
  res.json(await callExternalAPI(url, "weather"));
});

app.get("/air-quality", async (req, res) => {
  const { city = "Kinshasa" } = req.query;
  const url = `https://api.openaq.org/v2/latest?city=${city}`;
  res.json(await callExternalAPI(url, "air-quality"));
});

app.get("/disasters", async (req, res) => {
  const url = "https://eonet.gsfc.nasa.gov/api/v3/events";
  res.json(await callExternalAPI(url, "disasters"));
});

app.get("/fires", async (req, res) => {
  const url = "https://firms.modaps.eosdis.nasa.gov/api/area/csv/MODIS_C6_Global_24h.csv";
  res.json(await callExternalAPI(url, "fires"));
});

app.get("/floods", async (req, res) => {
  const url = "https://global-flood.emergency.copernicus.eu/api"; // placeholder
  res.json(await callExternalAPI(url, "floods"));
});

// Logs route
app.get("/logs", (req, res) => res.json(logs));

// --- Error handling ---
app.use((err, req, res, next) => {
  console.error("Erreur serveur:", err);
  res.status(500).json({ error: true, message: "Erreur interne du serveur" });
});

// --- Start ---
app.listen(PORT, () => {
  console.log(`API Gateway running on http://localhost:${PORT}`);
});
