const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

/* =========================
   🌐 FRONTEND (FIXED)
========================= */
app.use(express.static(__dirname));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

/* =========================
   🚀 SERVER
========================= */
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

/* =========================
   🧠 ORDER BOOK
========================= */
let orderBook = { buy: [], sell: [] };
let trades = [];

/* =========================
   💰 WALLETS
========================= */
let wallets = {
  user1: { usd: 1000, btc: 0 }
};

/* =========================
   📡 BROADCAST
========================= */
function broadcast(data) {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

/* =========================
   🔥 MATCH ENGINE
========================= */
function matchOrders() {
  orderBook.buy.sort((a, b) => b.price - a.price);
  orderBook.sell.sort((a, b) => a.price - b.price);

  while (orderBook.buy.length && orderBook.sell.length) {
    let buy = orderBook.buy[0];
    let sell = orderBook.sell[0];

    if (buy.price >= sell.price) {
      let qty = Math.min(buy.amount, sell.amount);
      let price = sell.price;

      trades.push({ price, qty, time: Date.now() });

      if (!wallets[buy.user]) wallets[buy.user] = { usd: 1000, btc: 0 };
      if (!wallets[sell.user]) wallets[sell.user] = { usd: 1000, btc: 0 };

      wallets[buy.user].usd -= qty * price;
      wallets[buy.user].btc += qty;

      wallets[sell.user].usd += qty * price;
      wallets[sell.user].btc -= qty;

      buy.amount -= qty;
      sell.amount -= qty;

      if (buy.amount <= 0) orderBook.buy.shift();
      if (sell.amount <= 0) orderBook.sell.shift();

      broadcast({ type: "trade", price, qty });

    } else {
      break;
    }
  }
}

/* =========================
   📥 ORDER API
========================= */
app.post("/order", (req, res) => {
  const { user, type, price, amount } = req.body;

  if (!wallets[user]) {
    wallets[user] = { usd: 1000, btc: 0 };
  }

  const order = { user, price, amount };

  if (type === "buy") orderBook.buy.push(order);
  else orderBook.sell.push(order);

  matchOrders();

  broadcast({
    type: "orderbook",
    orderBook
  });

  res.json({ success: true, orderBook });
});

/* =========================
   📊 ORDERBOOK
========================= */
app.get("/orderbook", (req, res) => {
  res.json(orderBook);
});

/* =========================
   💰 WALLET
========================= */
app.get("/wallet/:user", (req, res) => {
  const user = req.params.user;

  if (!wallets[user]) {
    wallets[user] = { usd: 1000, btc: 0 };
  }

  res.json(wallets[user]);
});

/* =========================
   📈 FAKE PRICE
========================= */
let price = 76000;

setInterval(() => {
  price += (Math.random() - 0.5) * 200;

  broadcast({
    type: "price",
    price: price.toFixed(2)
  });
}, 2000);

/* =========================
   🌐 WEBSOCKET
========================= */
wss.on("connection", (ws) => {
  ws.send(JSON.stringify({
    type: "init",
    price,
    orderBook,
    trades
  }));
});

/* =========================
   🚀 START SERVER
========================= */
server.listen(3000, () => {
  console.log("🔥 PROWALLET RUNNING: http://127.0.0.1:3000");
});
