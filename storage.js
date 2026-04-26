function safeNumber(value, fallback = 0) {
  let n = Number(value);
  return isNaN(n) ? fallback : n;
}

function saveData() {
  localStorage.setItem("balance", balance);
  localStorage.setItem("history", JSON.stringify(historyData));
  localStorage.setItem("position", JSON.stringify(position));
  updateUI();
}

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
