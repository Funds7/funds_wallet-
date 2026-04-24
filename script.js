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
  if (!price || balance <= 0) return alert("Cannot buy");

  btcOwned = balance / price;
  lastBuyPrice = price;
  balance = 0;

  saveData();
  addHistory(`🟢 Bought BTC at $${price.toFixed(2)}`);
}

// ================= SELL =================
async function sellBTC() {
  let price = await getBTCPrice();
  if (!price || btcOwned <= 0) return alert("No BTC");

  let newBalance = btcOwned * price;
  let profit = newBalance - (btcOwned * lastBuyPrice);

  balance = newBalance;
  btcOwned = 0;

  saveData();
  addHistory(`🔴 Sold BTC at $${price.toFixed(2)} | P/L: $${profit.toFixed(2)}`);
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
  localStorage.clear();
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
