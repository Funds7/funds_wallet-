function addTrade(type, amount) {
  const time = new Date().toLocaleTimeString();

  const li = document.createElement("li");

  li.innerText = `${type} $${amount} - ${time}`;

  if (type === "BUY") {
    li.style.borderLeft = "4px solid #00ff88";
    li.style.color = "#00ff88";
  } else {
    li.style.borderLeft = "4px solid #ff4d4d";
    li.style.color = "#ff4d4d";
  }

  document.getElementById("trades").prepend(li);
}
