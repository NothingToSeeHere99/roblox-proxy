const express = require("express");
const fetch = require("node-fetch");
const app = express();

// Root
app.get("/", (req, res) => {
  res.send("Roblox Proxy Running!");
});

// Return a random valid game
app.get("/random", async (req, res) => {
  try {
    let validGame = null;

    for (let i = 0; i < 5; i++) { // Try 5 times max
      const randomPlaceId = Math.floor(Math.random() * (1600000000 - 100000000) + 100000000);
      
      // Get universeId from placeId
      const universeRes = await fetch(`https://apis.roblox.com/universes/v1/places/${randomPlaceId}/universe`);
      if (!universeRes.ok) continue;

      const universeData = await universeRes.json();
      const universeId = universeData.universeId;

      // Now get game details
      const gameRes = await fetch(`https://games.roblox.com/v1/games?universeIds=${universeId}`);
      const gameData = await gameRes.json();
      const game = gameData.data[0];

      if (game && game.name !== "Untitled Game" && game.isPlayable && game.playing > 0) {
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
      res.status(404).json({ error: "No valid game found after 5 attempts." });
    }
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
});

// Optionally keep your other routes
app.get("/details/:placeId", async (req, res) => {
  try {
    const placeId = req.params.placeId;
    const universeRes = await fetch(`https://apis.roblox.com/universes/v1/places/${placeId}/universe`);
    const universeData = await universeRes.json();
    const universeId = universeData.universeId;

    const gameRes = await fetch(`https://games.roblox.com/v1/games?universeIds=${universeId}`);
    const gameData = await gameRes.json();
    res.json({ data: gameData.data[0] });
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Proxy running on port ${PORT}`);
});
