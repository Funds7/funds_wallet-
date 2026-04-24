function safeNumber(value, fallback = 0) {
let n = Number(value);
return isNaN(n) ? fallback : n;
}

let actionLock = false;
let botRunning = false;

const FEE_RATE = 0.001;

let strategy = {
takeProfit: 1.0,
stopLoss: 0.5,
tradeAmount: 200
};

let balance = safeNumber(localStorage.getItem("balance"), 1000);

let position = (() => {
try {
let p = JSON.parse(localStorage.getItem("position"));
return {
size: safeNumber(p?.size),
avgPrice: safeNumber(p?.avgPrice)
};
} catch {
return { size: 0, avgPrice: 0 };
}
})();

let historyData = (() => {
try {
let h = JSON.parse(localStorage.getItem("history")) || [];
return Array.isArray(h) ? h.slice(0, 50) : [];
} catch {
return [];
}
})();

let lastAction = 0;
let lastSeenPrice = 0;
let tradingInterval = null;

// ================= PRICE =================
async function getBTCPrice() {
try {
let res = await fetch("https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT");
let data = await res.json();

let price = parseFloat(data.price);  

let el = document.getElementById("price");  
if (el) el.innerText = price.toFixed(2);  

return price;

} catch (error) {
console.log("Price error:", error);

let el = document.getElementById("price");  
if (el) el.innerText = "Loading...";  

return null;

}
}

// ================= BUY =================
async function buyBTC() {
if (actionLock) return;
actionLock = true;

let price = await getBTCPrice();
if (!price) {
actionLock = false;
return;
}

let invest = strategy.tradeAmount;

if (balance < invest) {
actionLock = false;
return;
}

let fee = invest * FEE_RATE;
let netInvest = invest - fee;

let btcBought = netInvest / price;

let totalCost = position.avgPrice * position.size + price * btcBought;

position.size += btcBought;
position.avgPrice = totalCost / position.size;

balance -= invest;

addHistory({
type: "MANUAL",
side: "BUY",
amount: btcBought,
price: price,
value: invest,
profit: 0
});

lastAction = Date.now();

saveData();
actionLock = false;
}

// ================= SELL =================
async function sellBTC() {
if (actionLock) return;
actionLock = true;

let price = await getBTCPrice();
if (!price || position.size <= 0) {
actionLock = false;
return;
}

let amount = position.size;

let sellValue = amount * price;
let fee = sellValue * FEE_RATE;
let netSell = sellValue - fee;

let costValue = amount * position.avgPrice;
let profit = netSell - costValue;

balance += netSell;

addHistory({
type: "MANUAL",
side: "SELL",
amount,
price,
value: netSell,
profit
});

position.size = 0;
position.avgPrice = 0;

lastAction = Date.now();

saveData();
actionLock = false;
}

function deposit() {
let amount = Number(prompt("Enter deposit amount:"));

if (!amount || amount <= 0) return alert("Invalid amount");

balance += amount;

addHistory({
type: "SYSTEM",
side: "DEPOSIT",
amount: 0,
price: 0,
value: amount,
profit: 0
});

saveData();
}

function withdraw() {
let amount = prompt("Enter withdraw amount:");

amount = Number(amount);

if (!amount || amount <= 0) return alert("Invalid amount");
if (amount > balance) return alert("Not enough balance");

balance -= amount;

addHistory({
type: "SYSTEM",
side: "WITHDRAW",
amount: 0,
price: 0,
value: amount,
profit: 0
});

saveData();
}

function transfer() {
let amount = Number(prompt("Enter transfer amount:"));
let user = prompt("Enter receiver name:");

if (!amount || isNaN(amount) || amount <= 0) return alert("Invalid amount");
if (!user) return alert("Enter receiver");
if (amount > balance) return alert("Not enough balance");

balance -= amount;

addHistory({
type: "SYSTEM",
side: "TRANSFER",
amount: 0,
price: 0,
value: amount,
profit: 0
});

saveData();
}
// ================= SAVE =================
function saveData() {
localStorage.setItem("balance", balance);
localStorage.setItem("history", JSON.stringify(historyData));
localStorage.setItem("position", JSON.stringify(position));
updateUI();
}
// ================= UI =================
function updateUI() {
let bal = document.getElementById("balance");
if (bal) bal.innerText = balance.toFixed(2);

let btcEl = document.getElementById("btc");
if (btcEl) btcEl.innerText = position.size.toFixed(6);

let hist = document.getElementById("history");
if (hist) {
hist.innerHTML = "";

historyData.forEach(h => {  
  let p = document.createElement("p");  

  if (typeof h === "object") {  
    let color = "white";  

    if (h.side === "BUY") color = "lime";  
    else if (h.side === "SELL") color = "red";  
    else if (h.side === "DEPOSIT") color = "cyan";  
    else if (h.side === "WITHDRAW") color = "orange";  
    else if (h.side === "TRANSFER") color = "purple";  

    p.innerHTML = `  
      <span style="color:${color}">${h.side}</span>  
      ${h.amount ? h.amount.toFixed(6) + " BTC" : ""}  
      ${h.price ? "@ $" + h.price.toFixed(2) : ""}  
      | $${h.value?.toFixed(2)}  
      ${h.profit ? "| P/L: " + h.profit.toFixed(2) : ""}  
    `;  
  } else {  
    p.innerText = h;  
  }  

  hist.appendChild(p);  
});

}
}

// ================= PROFIT =================
function updateProfitDashboard(price) {
if (!price || position.size === 0) {
let el = document.getElementById("profit");
if (el) el.innerText = "0.00";
document.getElementById("profitPercent").innerText = "0%";
document.getElementById("totalValue").innerText = balance.toFixed(2);
return;
}

let entry = position.avgPrice;

let change = ((price - entry) / entry) * 100;

let positionValue = position.size * price;
let entryValue = position.size * entry;

let unrealizedPL = positionValue - entryValue;

document.getElementById("profit").innerText =
(Math.round(unrealizedPL * 100) / 100).toFixed(2);

document.getElementById("profitPercent").innerText =
change.toFixed(2) + "%";

document.getElementById("totalValue").innerText =
(balance + positionValue).toFixed(2);
}

// ================= HISTORY =================
function addHistory(entry) {
historyData.unshift({
type: entry.type,
side: entry.side,
amount: entry.amount,
price: entry.price,
value: entry.value,
profit: entry.profit || 0,
time: Date.now()
});

historyData = historyData.slice(0, 50);

localStorage.setItem("history", JSON.stringify(historyData));

updateUI();
}
// ================= LOGIN =================
function login() {
let input = document.getElementById("usernameInput");
if (!input || input.value === "") return alert("Enter username");

localStorage.setItem("user", input.value);
window.location.href = "dashboard.html";
}

// ================= LOGOUT =================
function logout() {
localStorage.removeItem("user");
window.location.href = "index.html";
}

// ================= INIT =================
window.addEventListener("load", () => {
let user = localStorage.getItem("user");
let nameEl = document.getElementById("username");
if (user && nameEl) nameEl.innerText = user;

updateUI();
getBTCPrice();

botLoop();
});
// ================= BOT =================
async function botLoop() {
  if (botRunning) return;
  botRunning = true;

  async function loop() {
    let price = await getBTCPrice();

    if (price) {
      updateProfitDashboard(price);

      let now = Date.now();

      if (now - lastAction >= 30000) {

        if (position.size === 0 && balance >= strategy.tradeAmount) {
          let changeFromLast = 0;

if (lastSeenPrice > 0) {
  changeFromLast = ((price - lastSeenPrice) / lastSeenPrice) * 100;
}

          if (changeFromLast <= -1.2) {
            lastAction = now;
            await buyBTC();
          }
        }

        else if (position.size > 0) {
          let profitPercent =
            ((price - position.avgPrice) / position.avgPrice) * 100;

          if (
            profitPercent >= strategy.takeProfit ||
            profitPercent <= -strategy.stopLoss
          ) {
            lastAction = now;
            await sellBTC();
          }
        }

        lastSeenPrice = price;
      }
    }

    setTimeout(loop, 10000);
  }

  loop();
}
setInterval(() => {
  actionLock = false;
}, 5000);
