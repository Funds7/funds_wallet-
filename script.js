let prices = { BTC: 76000, ETH: 2300 };
let priceInterval, portfolioInterval;

// ================= START APP =================
window.addEventListener("load", () => {
  const user = localStorage.getItem("user");

  if (user) {
    showApp();
  } else {
    document.getElementById("loginPage").style.display = "block";
    document.getElementById("app").style.display = "none";
  }
});

// ================= LOGIN =================
function login() {
  const u = document.getElementById("username").value;
  const p = document.getElementById("password").value;

  if (!u || !p) return alert("Enter login details");

  localStorage.setItem("user", u);

  // safe wallet init
  if (!localStorage.getItem("usd")) {
    localStorage.setItem("usd", "1000");
    localStorage.setItem("btc", "0");
    localStorage.setItem("eth", "0");
  }

  showApp();
}

// ================= SHOW APP =================
function showApp() {
  document.getElementById("loginPage").style.display = "none";
  document.getElementById("app").style.display = "block";

  document.getElementById("user").innerText =
    localStorage.getItem("user") || "Guest";

  clearInterval(priceInterval);
  clearInterval(portfolioInterval);

  updatePrices();
  updatePortfolio();
  loadChat();

  priceInterval = setInterval(updatePrices, 4000);
  portfolioInterval = setInterval(updatePortfolio, 2000);
}

// ================= LOGOUT =================
function logout() {
  localStorage.removeItem("user");

  clearInterval(priceInterval);
  clearInterval(portfolioInterval);

  location.reload();
}

// ================= PRICES =================
function updatePrices() {
  prices.BTC += (Math.random() - 0.5) * 200;
  prices.ETH += (Math.random() - 0.5) * 10;

  prices.BTC = Math.max(1000, prices.BTC);
  prices.ETH = Math.max(50, prices.ETH);

  const btcEl = document.getElementById("price");
  const ethEl = document.getElementById("ethPrice");

  if (btcEl) btcEl.innerText = "BTC: $" + prices.BTC.toFixed(2);
  if (ethEl) ethEl.innerText = "ETH: $" + prices.ETH.toFixed(2);
}

// ================= PORTFOLIO =================
function updatePortfolio() {
  let usd = Number(localStorage.getItem("usd")) || 0;
  let btc = Number(localStorage.getItem("btc")) || 0;
  let eth = Number(localStorage.getItem("eth")) || 0;

  let total = usd + btc * prices.BTC + eth * prices.ETH;

  if (!isFinite(total)) total = 0;

  const usdEl = document.getElementById("balance");
  const btcEl = document.getElementById("btcHold");
  const ethEl = document.getElementById("ethHold");
  const totalEl = document.getElementById("totalValue");

  if (usdEl) usdEl.innerText = usd.toFixed(2);
  if (btcEl) btcEl.innerText = btc.toFixed(8);
  if (ethEl) ethEl.innerText = eth.toFixed(6);
  if (totalEl) totalEl.innerText = total.toFixed(2);
}

// ================= TRADE BUY =================
function buy() {
  let amt = Number(document.getElementById("amount").value);
  if (!amt || amt <= 0) return;

  let usd = Number(localStorage.getItem("usd") || 0);
  let btc = Number(localStorage.getItem("btc") || 0);

  if (amt > usd) return alert("Not enough USD");

  usd -= amt;
  btc += amt / prices.BTC;

  localStorage.setItem("usd", usd);
  localStorage.setItem("btc", btc);

  updatePortfolio();
}

// ================= TRADE SELL =================
function sell() {
  let amt = Number(document.getElementById("amount").value);
  if (!amt || amt <= 0) return;

  let usd = Number(localStorage.getItem("usd") || 0);
  let btc = Number(localStorage.getItem("btc") || 0);

  let btcAmt = amt / prices.BTC;

  if (btcAmt > btc) return alert("Not enough BTC");

  btc -= btcAmt;
  usd += amt;

  localStorage.setItem("usd", usd);
  localStorage.setItem("btc", btc);

  updatePortfolio();
}

// ================= CHAT =================
function sendMsg() {
  let msg = document.getElementById("msg").value;
  if (!msg) return;

  let chat = JSON.parse(localStorage.getItem("chat") || "[]");
  chat.push(msg);

  localStorage.setItem("chat", JSON.stringify(chat));

  document.getElementById("msg").value = "";
  loadChat();
}

function loadChat() {
  let chat = JSON.parse(localStorage.getItem("chat") || "[]");
  const box = document.getElementById("chat");

  if (!box) return;

  box.innerHTML = chat.map(m => "💬 " + m).join("<br>");
}
