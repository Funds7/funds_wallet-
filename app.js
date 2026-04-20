// ===================== LOGIN =====================
function login() {
  let user = document.getElementById("username").value;
  let pass = document.getElementById("password").value;

  if (user && pass) {
    localStorage.setItem("user", user);
    window.location.href = "dashboard.html";
  } else {
    alert("Enter details");
  }
}

// ===================== DASHBOARD =====================
window.addEventListener("load", () => {

  let user = localStorage.getItem("user");

  if (!user) {
    window.location.href = "index.html";
    return;
  }

  // ===== USER DISPLAY =====
  const userEl = document.getElementById("user");
  if (userEl) userEl.innerText = user;

  // ===== LOAD DATA =====
  let usd = parseFloat(localStorage.getItem(user + "_usd")) || 1000;
  let btc = parseFloat(localStorage.getItem(user + "_btc")) || 0;
  let eth = parseFloat(localStorage.getItem(user + "_eth")) || 0;

  let initial = parseFloat(localStorage.getItem(user + "_initial"));

if (isNaN(initial)) {
  initial = 1000;
  localStorage.setItem(user + "_initial", initial);
}

  // ===== TRADE COOLDOWN =====
  let lastTradeTime = 0;

  function canTrade() {
    let now = Date.now();
    if (now - lastTradeTime < 2000) {
      alert("Wait 2 seconds between trades");
      return false;
    }
    lastTradeTime = now;
    return true;
  }

  // ===== SAVE =====
  function save() {
    localStorage.setItem(user + "_usd", usd);
    localStorage.setItem(user + "_btc", btc);
    localStorage.setItem(user + "_eth", eth);
  }

  // ===== UI UPDATE =====
  function updateUI() {
    const balance = document.getElementById("balance");
    const usdEl = document.getElementById("usd");
    const btcHold = document.getElementById("btc_hold");
    const ethHold = document.getElementById("eth_hold");

    if (balance) balance.innerText = usd.toFixed(2);
    if (usdEl) usdEl.innerText = usd.toFixed(2);
    if (btcHold) btcHold.innerText = btc.toFixed(6);
    if (ethHold) ethHold.innerText = eth.toFixed(6);
  }

  // ===== HISTORY =====
  function addHistory(text) {
    let history = document.getElementById("history");
    if (!history) return;

    let li = document.createElement("li");
    li.innerText = text;
    history.appendChild(li);
  }

  // ===== PRICES =====
  let btcPrice = 0;
  let ethPrice = 0;

  function updatePL() {
    let totalValue = usd + (btc * btcPrice) + (eth * ethPrice);
    let profit = totalValue - initial;
    let percent = initial ? (profit / initial) * 100 : 0;

    let plEl = document.getElementById("pl");
    if (!plEl) return;

    plEl.innerText =
      "P/L: $" + profit.toFixed(2) +
      " (" + percent.toFixed(2) + "%)";
  }

  // ===== PRICE LOADER =====
  async function loadPrices() {
    try {
      let res = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd"
      );

      if (!res.ok) return;

      let data = await res.json();

      btcPrice = data.bitcoin.usd;
      ethPrice = data.ethereum.usd;

      let btcEl = document.getElementById("btc");
      let ethEl = document.getElementById("eth");

      if (btcEl) btcEl.innerText = btcPrice;
      if (ethEl) ethEl.innerText = ethPrice;

      let total = usd + (btc * btcPrice) + (eth * ethPrice);

      let totalEl = document.getElementById("total");
      if (totalEl) totalEl.innerText = total.toFixed(2);

      updateUI();
      updatePL();

    } catch (err) {
      console.log("Price error:", err);
    }
  }

  // ===== BUY =====
  window.buy = function () {

    if (!canTrade()) return;

    let amt = parseFloat(document.getElementById("amount").value);

    if (!btcPrice || btcPrice <= 0) return alert("Prices loading...");
    if (isNaN(amt) || amt <= 0) return alert("Enter valid amount");
    if (amt > usd) return alert("Not enough USD");

    let btcBought = amt / btcPrice;

    usd -= amt;
    btc += btcBought;

    addHistory("BUY BTC $" + amt);

    save();
    updateUI();
    updatePL();
  };

  // ===== SELL =====
  window.sell = function () {

    if (!canTrade()) return;

    let amt = parseFloat(document.getElementById("amount").value);

    if (!btcPrice || btcPrice <= 0) return alert("Prices loading...");
    if (isNaN(amt) || amt <= 0) return alert("Enter valid amount");

    let btcToSell = amt / btcPrice;

    if (btcToSell > btc) return alert("Not enough BTC");

    btc -= btcToSell;
    usd += amt;

    addHistory("SELL BTC $" + amt);

    save();
    updateUI();
    updatePL();
  };

  // ===== LOGOUT =====
  window.logout = function () {
    localStorage.removeItem("user");
    window.location.href = "index.html";
  };

  // ===== START =====
updateUI();
updatePL();

loadPrices();
setTimeout(loadPrices, 500); // optional fast refresh
setInterval(loadPrices, 10000);
});
