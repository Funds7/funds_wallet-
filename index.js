const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const cors = require("cors");
const path = require("path");
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.redirect("/login.html");
});
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

/* =========================
   🧠 ORDER BOOK (CORE ENGINE)
========================= */

let orderBook = {
  buy: [],   // bids
  sell: []   // asks
};

let trades = [];

/* =========================
   💰 USERS WALLET
========================= */

let wallets = {
  user1: { usd: 1000, btc: 0 }
};

/* =========================
   📡 WEBSOCKET CONNECTIONS
========================= */

function broadcast(data) {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

/* =========================
   🔥 MATCHING ENGINE
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

      // execute trade
      trades.push({ price, qty, time: Date.now() });

      wallets[buy.user].usd -= qty * price;
      wallets[buy.user].btc += qty;

      wallets[sell.user].usd += qty * price;
      wallets[sell.user].btc -= qty;

      buy.amount -= qty;
      sell.amount -= qty;

      if (buy.amount === 0) orderBook.buy.shift();
      if (sell.amount === 0) orderBook.sell.shift();

      broadcast({
        type: "trade",
        price,
        qty
      });

    } else {
      break;
    }
  }
}

/* =========================
   📥 PLACE ORDER API
========================= */

app.post("/order", (req, res) => {
  const { user, type, price, amount } = req.body;

  if (!wallets[user]) {
    wallets[user] = { usd: 1000, btc: 0 };
  }

  const order = { user, price, amount };

  if (type === "buy") {
    orderBook.buy.push(order);
  } else {
    orderBook.sell.push(order);
  }

  matchOrders();

  broadcast({
    type: "orderbook",
    orderBook
  });

  res.json({ success: true, orderBook });
});

/* =========================
   📊 GET ORDER BOOK
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
   📈 MARKET PRICE (FAKE ENGINE)
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
  console.log("🔥 Exchange backend running on http://localhost:3000");
});
