let prices = { BTC: 76000, ETH: 2300 };
let priceInterval, portfolioInterval;

// ================= START APP =================
window.addEventListener("load", () => {
  const user = localStorage.getItem("user");

  if (user) {
    showApp();
  }
});

// ================= LOGIN =================
function login() {
  const u = document.getElementById("username").value;
  const p = document.getElementById("password").value;

  if (!u || !p) return alert("Enter login details");

  localStorage.setItem("user", u);

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

  document.getElementById("user").innerText = localStorage.getItem("user");

  clearInterval(priceInterval);
  clearInterval(portfolioInterval);

  priceInterval = setInterval(updatePrices, 4000);
  portfolioInterval = setInterval(updatePortfolio, 2000);

  loadChat();
  updatePortfolio();
}

// ================= LOGOUT (CLEAN RESET) =================
function logout() {
  localStorage.removeItem("user");
  clearInterval(priceInterval);
  clearInterval(portfolioInterval);
  location.reload();
}

// ================= PRICES =================
function updatePrices() {
  prices.BTC += (Math.random() - 0.5) * 250;
  prices.ETH += (Math.random() - 0.5) * 15;

  document.getElementById("btcPrice").innerText =
    "BTC: $" + prices.BTC.toFixed(2);

  document.getElementById("ethPrice").innerText =
    "ETH: $" + prices.ETH.toFixed(2);
}

// ================= PORTFOLIO SAFE =================
function updatePortfolio() {
  let usd = Number(localStorage.getItem("usd")) || 0;
  let btc = Number(localStorage.getItem("btc")) || 0;
  let eth = Number(localStorage.getItem("eth")) || 0;

  let btcPrice = Number(prices.BTC) || 0;
  let ethPrice = Number(prices.ETH) || 0;

  let total = usd + (btc * btcPrice) + (eth * ethPrice);

  if (!isFinite(total)) total = 0;

  document.getElementById("balance").innerText = usd.toFixed(2);
  document.getElementById("btcHold").innerText = btc.toFixed(8);
  document.getElementById("ethHold").innerText = eth.toFixed(6);
  document.getElementById("totalValue").innerText = total.toFixed(2);
}

// ================= TRADE SAFE =================
function buy() {
  let amt = Number(document.getElementById("amount").value);
  if (amt <= 0) return;

  let usd = Number(localStorage.getItem("usd") || 0);
  let btc = Number(localStorage.getItem("btc") || 0);

  if (amt > usd) return alert("Not enough USD");

  usd -= amt;
  btc += amt / prices.BTC;

  localStorage.setItem("usd", usd);
  localStorage.setItem("btc", btc);

  updatePortfolio();
}

function sell() {
  let amt = Number(document.getElementById("amount").value);
  if (amt <= 0) return;

  let btc = Number(localStorage.getItem("btc") || 0);
  let usd = Number(localStorage.getItem("usd") || 0);

  let btcAmt = amt / prices.BTC;

  if (btcAmt > btc) return alert("Not enough BTC");

  btc -= btcAmt;
  usd += amt;

  localStorage.setItem("btc", btc);
  localStorage.setItem("usd", usd);

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
  document.getElementById("chat").innerHTML =
    chat.map(m => "💬 " + m).join("<br>");
}
