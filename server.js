const express = require("express");
const fetch = require("node-fetch");
const app = express();

app.get("/", (req, res) => {
  res.send("Roblox Proxy Running!");
});

app.get("/listnull", async (req, res) => {
  try {
    const response = await fetch("https://games.roblox.com/v1/games/list");
    const data = await response.json();
    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
});

app.get("/list/:keywords", async (req, res) => {
  try {
    const keywords = req.params.keywords;
    const url = `https://search.roblox.com/catalog/json?Keyword=${encodeURIComponent(keywords)}&Category=1`;
    const response = await fetch(url);
    const data = await response.json();
    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
});

app.get("/details/:placeId", async (req, res) => {
  try {
    const placeId = req.params.placeId;
    const response = await fetch(`https://games.roblox.com/v1/games?universeIds=${placeId}`);
    const data = await response.json();
    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Proxy running on port ${PORT}`);
});
