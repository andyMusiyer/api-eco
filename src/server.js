// server.js
import express from "express";
import fetch from "node-fetch";
import sqlite3 from "sqlite3";
import { open } from "sqlite";

const app = express();
const PORT = 3000;

// --- DB INIT ---
let db;
(async () => {
  db = await open({
    filename: "./gateway.db",
    driver: sqlite3.Database,
  });
  await db.exec("CREATE TABLE IF NOT EXISTS logs (id INTEGER PRIMARY KEY, route TEXT, status TEXT, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)");
})();

// --- Helper for external API calls ---
async function callExternalAPI(url, routeName) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Erreur API externe: ${res.status}`);
    const data = await res.json();
    await db.run("INSERT INTO logs (route, status) VALUES (?, ?)", [routeName, "success"]);
    return data;
  } catch (err) {
    await db.run("INSERT INTO logs (route, status) VALUES (?, ?)", [routeName, "error"]);
    return { error: true, message: err.message };
  }
}

// --- Routes ---

// Météo (Open-Meteo)
app.get("/weather", async (req, res) => {
  const { lat = "-4.325", lon = "15.322" } = req.query; // Kinshasa par défaut
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
  const data = await callExternalAPI(url, "weather");
  res.json(data);
});

// Qualité de l’air (OpenAQ)
app.get("/air-quality", async (req, res) => {
  const { city = "Kinshasa" } = req.query;
  const url = `https://api.openaq.org/v2/latest?city=${city}`;
  const data = await callExternalAPI(url, "air-quality");
  res.json(data);
});

// Catastrophes naturelles (NASA EONET)
app.get("/disasters", async (req, res) => {
  const url = "https://eonet.gsfc.nasa.gov/api/v3/events";
  const data = await callExternalAPI(url, "disasters");
  res.json(data);
});

// Incendies (NASA FIRMS)
app.get("/fires", async (req, res) => {
  const url = "https://firms.modaps.eosdis.nasa.gov/api/area/csv/MODIS_C6_Global_24h.csv";
  const data = await callExternalAPI(url, "fires");
  res.json(data);
});

// Inondations (Copernicus GloFAS)
app.get("/floods", async (req, res) => {
  const url = "https://global-flood.emergency.copernicus.eu/api"; // endpoint fictif simplifié
  const data = await callExternalAPI(url, "floods");
  res.json(data);
});

// --- Error handling middleware ---
app.use((err, req, res, next) => {
  console.error("Erreur serveur:", err);
  res.status(500).json({ error: true, message: "Erreur interne du serveur" });
});

// --- Start server ---
app.listen(PORT, () => {
  console.log(`API Gateway running on http://localhost:${PORT}`);
});
