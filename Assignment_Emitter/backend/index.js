const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());
app.use(cors());

const Redis = require("ioredis");
const { generateRandomCards } = require("./utils");
const redis = new Redis();

const server = http.createServer(app);
const io = socketIO(server);

const getLatestLeaderboard = async () => {
  const leaderboard = await redis.zrevrange("leaderboard", 0, -1, "WITHSCORES");
  const formatedLeaderboard = [];
  // formatting into the required format
  for (let i = 0; i < leaderboard.length; i += 2) {
    const userName = leaderboard[i];
    const userScore = parseInt(leaderboard[i + 1]);
    formatedLeaderboard.push({ userName, userScore });
  }
  return formatedLeaderboard;
};

// WebSocket connection handling
io.on("connection", (socket) => {
  console.log("WebSocket connected");

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log("WebSocket disconnected");
  });
});

app.get("/game", async (req, res) => {
  try {
    const { userName } = req.query;

    // Check if the member already exists
    let isMember = await redis.exists(userName);

    // Initialize the game for the new user
    if (!isMember && userName) {
      const randomCards = generateRandomCards();
      await redis.hmset(
        userName,
        "score",
        0,
        "gameCards",
        JSON.stringify(randomCards),
        "hasDefuseCard",
        "false",
        "activeCard",
        null
      );
      redis.zadd("leaderboard", 0, userName);
    }

    // Get game state from Redis
    let game = await redis.hgetall(userName);
    const leaderboardLatest = await getLatestLeaderboard();
    io.emit("leaderboardUpdate", leaderboardLatest);

    // Parse gameCards from string to array
    const parsedGameCards = JSON.parse(game.gameCards || "[]");

    // Send the correct score along with the game state
    res.status(200).send({
      ...game,
      gameCards: parsedGameCards,
      score: parseInt(game.score), // Parse score as integer
    });
  } catch (e) {
    console.log(e);
    res.status(500).send("Failed to fetch data");
  }
});

app.put("/game", async (req, res) => {
  try {
    const { userName, hasDefuseCard, activeCard } = req.body;
    const score = req.body.score || 0;
    const gameCards = req.body.gameCards
      ? req.body.gameCards
      : generateRandomCards();
    insertGame = await redis.hmset(
      userName,
      "gameCards",
      JSON.stringify(gameCards),
      "hasDefuseCard",
      hasDefuseCard,
      "activeCard",
      activeCard,
      "score",
      score
    );
    // Update the score of the user
    redis.zadd("leaderboard", score, userName);

    // Emit the latest leaderboard
    const leaderboardLatest = await getLatestLeaderboard();
    io.emit("leaderboardUpdate", leaderboardLatest);

    res.status(200).send({ ...req.body, gameCards, score });
  } catch (e) {
    console.log(e);
    res.status(500).send("Failed to fetch data");
  }
});

app.delete("/game", async (req, res) => {
  try {
    const { userName } = req.body;
    const emptyArray = [];
    insertGame = await redis.hmset(
      userName,
      "gameCards",
      emptyArray,
      "hasDefuseCard",
      "false",
      "activeCard",
      null
    );
    const score = redis.hget(userName, "score");
    redis.zadd("leaderboard", score, userName);

    // Emit the latest leaderboard
    const leaderboardLatest = await getLatestLeaderboard();
    io.emit("leaderboardUpdate", leaderboardLatest);

    res.status(200).send("Reset successful");
  } catch (e) {
    console.log(e);
    res.status(500).send("Failed to fetch data");
  }
});

server.listen(3000, () => {
  console.log("App is running on port 3000");
});
