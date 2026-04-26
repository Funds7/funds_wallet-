
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
  try {
    if (actionLock) return;
    actionLock = true;

    let price = await getBTCPrice();
    if (!price) return;

    let invest = strategy.tradeAmount;

    if (balance < invest) return;

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
      price,
      value: invest,
      profit: 0
    });

    lastAction = Date.now();
    saveData();

  } catch (err) {
    console.log("BUY error:", err);
  } finally {
    actionLock = false; // 🔥 ALWAYS RESET
  }
}

// ================= SELL =================
async function sellBTC() {
  try {
    if (actionLock) return;
    actionLock = true;

    let price = await getBTCPrice();
    if (!price || position.size <= 0) return;

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

  } catch (err) {
    console.log("SELL error:", err);
  } finally {
    actionLock = false; // 🔥 ALWAYS RESET
  }
}

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
