// ================= LOAD DATA =================
let balance = Number(localStorage.getItem("balance")) || 1000;
let btcOwned = Number(localStorage.getItem("btc")) || 0;
let lastBuyPrice = Number(localStorage.getItem("lastPrice")) || 0;
let historyData = JSON.parse(localStorage.getItem("history")) || [];

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
    if (el) el.innerText = "Error";
  }
}

// ================= BUY =================
async function buyBTC() {
  let price = await getBTCPrice();

  let investAmount = 100; // fixed trade amount

  if (balance < investAmount) {
    return alert("Not enough balance");
  }

  let btc = investAmount / price;

  btcOwned += btc;
  balance -= investAmount;

  lastBuyPrice = price;

  saveData();
  addHistory(`🟢 Bought BTC ($${investAmount}) at $${price.toFixed(2)}`);
}

// ================= SELL =================
async function sellBTC() {
  let price = await getBTCPrice();

  if (btcOwned <= 0) {
    return alert("No BTC");
  }

  let sellValue = btcOwned * price;
  let costBasis = btcOwned * lastBuyPrice;

  let profit = sellValue - costBasis;

  balance += sellValue;
  btcOwned = 0;

  saveData();

  let profitText = profit >= 0
    ? `+$${profit.toFixed(2)}`
    : `-$${Math.abs(profit).toFixed(2)}`;

  addHistory(`🔴 Sold BTC at $${price.toFixed(2)} | P/L: ${profitText}`);
}

// ================= SAVE =================
function saveData() {
  localStorage.setItem("balance", balance);
  localStorage.setItem("btc", btcOwned);
  localStorage.setItem("lastPrice", lastBuyPrice);
  localStorage.setItem("history", JSON.stringify(historyData));
  updateUI();
}

// ================= UI =================
function updateUI() {
  let bal = document.getElementById("balance");
  if (bal) bal.innerText = balance.toFixed(2);

  let btcEl = document.getElementById("btc");
  if (btcEl) btcEl.innerText = btcOwned.toFixed(6);

  let hist = document.getElementById("history");
  if (hist) {
    hist.innerHTML = "";
    historyData.forEach(h => {
      let p = document.createElement("p");
      p.innerText = h;
      hist.appendChild(p);
    });
  }
}

// ================= HISTORY =================
function addHistory(text) {
  historyData.unshift(text);
  saveData();
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
  setInterval(getBTCPrice, 5000);
});
