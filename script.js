let balance = 1000;
let btcOwned = 0;
let lastBuyPrice = 0;

async function getBTCPrice() {
  let res = await fetch("https://api.coindesk.com/v1/bpi/currentprice/BTC.json");
  let data = await res.json();
  let price = data.bpi.USD.rate_float;

  let priceEl = document.getElementById("price");
  if (priceEl) priceEl.innerText = price.toFixed(2);

  return price;
}

async function buyBTC() {
  let price = await getBTCPrice();

  if (balance <= 0) {
    alert("No balance to buy!");
    return;
  }

  btcOwned = balance / price;
  lastBuyPrice = price;
  balance = 0;

  updateUI();
  addHistory(`🟢 Bought BTC at $${price.toFixed(2)}`);
}

async function sellBTC() {
  let price = await getBTCPrice();

  if (btcOwned <= 0) {
    alert("No BTC to sell!");
    return;
  }

  let newBalance = btcOwned * price;
  let profit = newBalance - (btcOwned * lastBuyPrice);

  balance = newBalance;
  btcOwned = 0;

  updateUI();
  addHistory(`🔴 Sold BTC at $${price.toFixed(2)} | P/L: $${profit.toFixed(2)}`);
}

function updateUI() {
  let balEl = document.getElementById("balance");
  if (balEl) balEl.innerText = balance.toFixed(2);
}

function addHistory(text) {
  let history = document.getElementById("history");
  if (!history) return;

  let item = document.createElement("p");
  item.innerText = text;
  history.prepend(item);
}

// ================= LOGIN SYSTEM =================

function login() {
  let usernameInput = document.getElementById("usernameInput");

  if (!usernameInput) return;

  let username = usernameInput.value;

  if (username === "") {
    alert("Enter username");
    return;
  }

  localStorage.setItem("user", username);
  window.location.href = "dashboard.html";
}

function logout() {
  localStorage.removeItem("user");
  window.location.href = "index.html";
}

// show username on dashboard
let user = localStorage.getItem("user");
if (user) {
  let el = document.getElementById("username");
  if (el) el.innerText = user;
}

// auto update price
setInterval(getBTCPrice, 5000);
getBTCPrice();
