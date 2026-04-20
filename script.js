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

  // ===== USER =====
  const userEl = document.getElementById("user");
  if (userEl) userEl.innerText = user;

  // ===== DATA =====
  let usd = parseFloat(localStorage.getItem(user + "_usd")) || 1000;
  let btc = parseFloat(localStorage.getItem(user + "_btc")) || 0;
  let eth = parseFloat(localStorage.getItem(user + "_eth")) || 0;

  let initial = parseFloat(localStorage.getItem(user + "_initial"));
  if (!initial || isNaN(initial)) {
    initial = 1000;
    localStorage.setItem(user + "_initial", initial);
  }

  // ===== PRICES =====
  let btcPrice = 0;
  let ethPrice = 0;

  // ===== COOLDOWN =====
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

  // ===== ANIMATION =====
  function animatePrice(el, value) {
    if (!el) return;

    el.classList.add("flash-up");
    el.innerText = value;

    setTimeout(() => {
      el.classList.remove("flash-up");
    }, 300);
  }

  // ===== TIME =====
  function updateTime() {
    const el = document.getElementById("lastUpdate");
    if (!el) return;

    el.innerText = "Last Update: " + new Date().toLocaleTimeString();
  }

  // ===== UI =====
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
    let historyData = JSON.parse(localStorage.getItem(user + "_history")) || [];

    historyData.push({
      text: text,
      time: new Date().toLocaleTimeString()
    });

    localStorage.setItem(user + "_history", JSON.stringify(historyData));

    renderHistory();
  }

  function renderHistory() {
    let historyEl = document.getElementById("history");
    if (!historyEl) return;

    historyEl.innerHTML = "";

    let historyData = JSON.parse(localStorage.getItem(user + "_history")) || [];

    historyData.slice().reverse().forEach(item => {
      let li = document.createElement("li");
      li.innerText = `${item.text} • ${item.time}`;
      historyEl.appendChild(li);
    });
  }

  // ===== P/L =====
  function updatePL() {
    let total = usd + (btc * btcPrice) + (eth * ethPrice);
    let profit = total - initial;
    let percent = (profit / initial) * 100;

    const plEl = document.getElementById("pl");
    if (!plEl) return;

    plEl.innerText =
      "P/L: $" + profit.toFixed(2) +
      " (" + percent.toFixed(2) + "%)";
  }

  // ===== SOUND + VIBRATION =====
  function tradeFeedback(type) {

    if (navigator.vibrate) {
      navigator.vibrate(type === "buy" ? 80 : 150);
    }

    const audio = new Audio(
      type === "buy"
        ? "https://actions.google.com/sounds/v1/cartoon/pop.ogg"
        : "https://actions.google.com/sounds/v1/alarms/beep_short.ogg"
    );

    audio.volume = 0.5;
    audio.play().catch(() => {});
  }

  // ===== PRICE LOAD =====
  function loadPrices() {
    fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd")
      .then(res => res.json())
      .then(data => {

        btcPrice = data.bitcoin.usd;
        ethPrice = data.ethereum.usd;

        const btcEl = document.getElementById("btc");
        const ethEl = document.getElementById("eth");

        if (btcEl) animatePrice(btcEl, btcPrice);
        if (ethEl) animatePrice(ethEl, ethPrice);

        let total = usd + (btc * btcPrice) + (eth * ethPrice);

        const totalEl = document.getElementById("total");
        if (totalEl) totalEl.innerText = total.toFixed(2);

        updateUI();
        updatePL();
        updateTime();
      })
      .catch(err => console.log(err));
  }

  // ===== BUY =====
  window.buy = function () {

    if (!canTrade()) return;

    let amt = parseFloat(document.getElementById("amount").value);

    if (!btcPrice) return alert("Prices loading...");
    if (isNaN(amt) || amt <= 0) return alert("Enter valid amount");
    if (amt > usd) return alert("Not enough USD");

    btc += amt / btcPrice;
    usd -= amt;

    tradeFeedback("buy");
    addHistory("BUY BTC $" + amt);

    save();
    updateUI();
    updatePL();
  };

  // ===== SELL =====
  window.sell = function () {

    if (!canTrade()) return;

    let amt = parseFloat(document.getElementById("amount").value);

    if (!btcPrice) return alert("Prices loading...");
    if (isNaN(amt) || amt <= 0) return alert("Enter valid amount");

    let btcToSell = amt / btcPrice;

    if (btcToSell > btc) return alert("Not enough BTC");

    btc -= btcToSell;
    usd += amt;

    tradeFeedback("sell");
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
  updateTime();
  renderHistory();

  setInterval(updateTime, 1000);
  loadPrices();
  setInterval(loadPrices, 10000);

});
