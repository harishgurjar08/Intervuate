// server.js
import express from "express";
import { AccessToken } from "livekit-server-sdk";
import cors from 'cors'

const app = express();
app.use(express.json());

app.use(cors("*"))
app.use(express.urlencoded({extended:true}));

// Use your LiveKit API key and secret
const API_KEY = "APINkvsH5xNwBbq";
const API_SECRET = "oDaSWtvhL8eCpKMgSqifoH07gefuSSca4HTq2XZpRFaA";
const LIVEKIT_URL = "wss://minor-ceplfz5f.livekit.cloud"; 


app.post("/api/livekit-token", async (req, res) => {
  const { identity, room } = req.body;
console.log("Body ",req.body);

  if (!identity || !room) {
    return res.status(400).json({ error: "identity and room are required" });
  }

  const at = new AccessToken(API_KEY, API_SECRET, { identity });
  at.addGrant({ roomJoin: true, room });
  console.log(at);
  let secret  = await at.toJwt();
  console.log(secret);
  
  
  res.json({ token: secret });
});


app.listen(3000, () => console.log("Backend running on port 3000"));

