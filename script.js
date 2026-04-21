document.getElementById("user").innerText =
  localStorage.getItem("user") || "Guest";

const priceEl = document.getElementById("price");

// FIXED WebSocket connection
const ws = new WebSocket(`ws://${window.location.host}`);

ws.onopen = () => {
  console.log("WebSocket connected");
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);

  if (data.type === "price") {
    priceEl.innerText = "$" + data.price;
  }
};

ws.onerror = () => {
  priceEl.innerText = "Connection error";
};
