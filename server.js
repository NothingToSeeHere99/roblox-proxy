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
    const universeRes = await fetch(`https://apis.roblox.com/universes/v1/places/${placeId}/universe`);
    if (!universeRes.ok) {
      return res.status(404).json({ error: "Universe not found for placeId: " + placeId });
    }
    const universeData = await universeRes.json();
    const universeId = universeData.universeId;

    const gameRes = await fetch(`https://games.roblox.com/v1/games?universeIds=${universeId}`);
    if (!gameRes.ok) {
      return res.status(404).json({ error: "Game not found for universeId: " + universeId });
    }
    const gameData = await gameRes.json();
    res.json({ data: gameData.data[0] });
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
});

// Updated /random endpoint with increased attempts and relaxed filters
app.get("/random", async (req, res) => {
  try {
    let validGame = null;

    for (let i = 0; i < 30; i++) {
      const randomPlaceId = Math.floor(Math.random() * (1600000000 - 100000000) + 100000000);

      const universeRes = await fetch(`https://apis.roblox.com/universes/v1/places/${randomPlaceId}/universe`);
      if (!universeRes.ok) continue;

      const universeData = await universeRes.json();
      const universeId = universeData.universeId;

      const gameRes = await fetch(`https://games.roblox.com/v1/games?universeIds=${universeId}`);
      if (!gameRes.ok) continue;

      const gameData = await gameRes.json();
      const game = gameData.data[0];

      if (game /*&& game.isPlayable && game.playing > 0*/) {
        validGame = {
          placeId: randomPlaceId,
          name: game.name,
          creatorName: game.creator.name,
          playing: game.playing,
          universeId: universeId
        };
        break;
      }
    }

    if (validGame) {
      res.json(validGame);
    } else {
      res.status(404).json({ error: "No valid game found after 30 attempts." });
    }
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Proxy running on port ${PORT}`);
});
