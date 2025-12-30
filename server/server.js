import express from "express";
import dotenv from "dotenv";
import fetch from "node-fetch";
import path from "node:path";
import { fileURLToPath } from "node:url";
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = Number(process.env.PORT ?? 3001);

// Allow express to parse JSON bodies
app.use(express.json());

app.post("/api/token", async (req, res) => {
  
  // Exchange the code for an access_token
  const response = await fetch(`https://discord.com/api/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: process.env.DISCORD_CLIENT_ID ?? process.env.VITE_DISCORD_CLIENT_ID,
      client_secret: process.env.DISCORD_CLIENT_SECRET,
      grant_type: "authorization_code",
      code: req.body.code,
    }),
  });

  // Retrieve the access_token from the response
  const { access_token } = await response.json();

  // Return the access_token to our client as { access_token: "..."}
  res.send({access_token});
});

const clientDistPath = path.resolve(__dirname, "../client/dist");
app.use(express.static(clientDistPath));

app.get("/", (req, res) => {
  res.sendFile(path.join(clientDistPath, "index.html"));
});

app.get("*", (req, res) => {
  if (req.path.startsWith("/api/")) {
    res.status(404).send("Not Found");
    return;
  }

  res.sendFile(path.join(clientDistPath, "index.html"));
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
