let balance = 1000;
let position = 0; // how much asset user holds
let entryPrice = 0;

// Simulated market price
let price = 100;

// start price movement
setInterval(() => {
  let change = (Math.random() - 0.5) * 2; // random up/down
  price += change;

  if (price < 1) price = 1;

  updateMarketUI();
  updateBalance();
}, 2000);

function login() {
  document.getElementById("loginScreen").style.display = "none";
  document.getElementById("app").style.display = "block";

  updateBalance();
  updateMarketUI();
}

function logout() {
  document.getElementById("loginScreen").style.display = "block";
  document.getElementById("app").style.display = "none";
}

// BUY = enter position at current price
function buy() {
  if (balance <= 0) return;

  position = 1;
  entryPrice = price;

  addTrade("BUY", price);
  updateBalance();
}

// SELL = close position
function sell() {
  if (position === 0) return;

  let profit = (price - entryPrice) * 10; // multiplier effect
  balance += profit;

  addTrade("SELL", price + " | P/L: $" + profit.toFixed(2));

  position = 0;
  entryPrice = 0;

  updateBalance();
}

// update balance display
function updateBalance() {
  document.querySelector(".balance-card h1").innerText =
    "$" + balance.toFixed(2);
}

// show live market price
function updateMarketUI() {
  document.querySelector(".profit").innerText =
    "Market Price: $" + price.toFixed(2);
}

// trade history
function addTrade(type, info) {
  let li = document.createElement("li");
  li.innerText =
    type + " → " + info + " - " + new Date().toLocaleTimeString();

  document.getElementById("trades").appendChild(li);
}
