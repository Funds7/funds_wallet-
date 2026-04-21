const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const path = require("path");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// HOME PAGE
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

/* ================= PRICE ENGINE ================= */
let price = 76000;

setInterval(() => {
  price += (Math.random() - 0.5) * 200;

  const data = JSON.stringify({
    type: "price",
    price: price.toFixed(2),
  });

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}, 2000);

/* ================= WEBSOCKET ================= */
wss.on("connection", (ws) => {
  ws.send(JSON.stringify({ type: "price", price: price.toFixed(2) }));
});

/* ================= START SERVER ================= */
server.listen(3000, () => {
  console.log("🔥 ProWallet running on http://localhost:3000");
});
