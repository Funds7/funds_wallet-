function login() {
  let user = document.getElementById("username").value;
  let pass = document.getElementById("password").value;

  if(user && pass){
    localStorage.setItem("user", user);
    window.location.href = "dashboard.html";
  } else {
    alert("Enter details");
  }
}

// ===================== DASHBOARD =====================
window.addEventListener("load", () => {

  let user = localStorage.getItem("user");

  if(!user){
    window.location.href = "index.html";
    return;
  }

  document.getElementById("user").innerText = user;

  // ===== LOAD DATA =====
  let usd = parseFloat(localStorage.getItem(user+"_usd")) || 1000;
  let btc = parseFloat(localStorage.getItem(user+"_btc")) || 0;
  let eth = parseFloat(localStorage.getItem(user+"_eth")) || 0;

  // ===== SAVE =====
  function save(){
    localStorage.setItem(user+"_usd", usd);
    localStorage.setItem(user+"_btc", btc);
    localStorage.setItem(user+"_eth", eth);
  }

  // ===== UPDATE UI =====
  function updateUI(){
    document.getElementById("balance").innerText = usd.toFixed(2);
    document.getElementById("usd").innerText = usd.toFixed(2);
    document.getElementById("btc_hold").innerText = btc.toFixed(6);
    document.getElementById("eth_hold").innerText = eth.toFixed(6);
  }

  updateUI();

  // ===== HISTORY =====
  function addHistory(text){
    let li = document.createElement("li");
    li.innerText = text;
    document.getElementById("history").appendChild(li);
  }

  // ===== PRICES =====
  let btcPrice = 0;
  let ethPrice = 0;

  async function loadPrices() {
    try {
      let res = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd");
      let data = await res.json();

      btcPrice = data.bitcoin.usd;
      ethPrice = data.ethereum.usd;

      document.getElementById("btc").innerText = btcPrice;
      document.getElementById("eth").innerText = ethPrice;

      let total = usd + (btc * btcPrice) + (eth * ethPrice);
      document.getElementById("total").innerText = total.toFixed(2);

    } catch (err) {
      console.log("Price error:", err);
    }
  }

  // ===== BUY =====
  window.buy = function(){
    let amt = parseFloat(document.getElementById("amount").value);

    if(isNaN(amt) || amt <= 0) return alert("Enter valid amount");
    if(amt > usd) return alert("Not enough USD");

    let btcBought = amt / btcPrice;

    usd -= amt;
    btc += btcBought;

    addHistory("BUY BTC $" + amt);
    save();
    updateUI();
  }

  // ===== SELL =====
  window.sell = function(){
    let amt = parseFloat(document.getElementById("amount").value);

    if(isNaN(amt) || amt <= 0) return alert("Enter valid amount");

    let btcToSell = amt / btcPrice;

    if(btcToSell > btc) return alert("Not enough BTC");

    btc -= btcToSell;
    usd += amt;

    addHistory("SELL BTC $" + amt);
    save();
    updateUI();
  }

  // ===== LOGOUT =====
  window.logout = function(){
    localStorage.removeItem("user");
    window.location.href = "index.html";
  }

  // ===== RUN PRICES =====
  loadPrices();
  setInterval(loadPrices, 10000);

});
