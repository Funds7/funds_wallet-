document.getElementById("user").innerText =
  localStorage.getItem("user") || "Guest";

const ws = new WebSocket("ws://localhost:3000");

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);

  if (data.type === "price") {
    document.getElementById("price").innerText = "$" + data.price;
  }
};
