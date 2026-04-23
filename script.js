console.log("script loaded");

// LOGIN
function login(){
  const user = document.getElementById("user").value.trim();

  if(!user || user.length < 3){
    alert("Username must be at least 3 characters");
    return;
  }

  const safeUser = user.replace(/</g, "").replace(/>/g, "");

  localStorage.setItem("user", safeUser);
  localStorage.setItem("auth", "true");

  window.location.replace("./dashboard.html");
}

// DASHBOARD CHECK
window.onload = function(){
  const auth = localStorage.getItem("auth");
  const user = localStorage.getItem("user");

  if(window.location.pathname.includes("dashboard.html")){
    if(auth !== "true" || !user){
      window.location.replace("./index.html");
      return;
    }

    const el = document.getElementById("username");
    if(el) el.innerText = user;
  }
};

// LOGOUT
function logout(){
  localStorage.clear();
  window.location.replace("./index.html");
}
// FAKE PRICE ENGINE
let price = 65000;
let balance = 1000;

function updatePrice(){
  price += (Math.random() - 0.5) * 500;

  const el = document.getElementById("price");
  if(el) el.innerText = price.toFixed(2);
}

setInterval(updatePrice, 2000);

// BUY FUNCTION
function buy(){
  if(balance < 100){
    alert("Not enough balance");
    return;
  }

  balance -= 100;

  const el = document.getElementById("balance");
  if(el) el.innerText = balance;

  addHistory("Bought BTC at " + price.toFixed(2));
}

// SELL FUNCTION
function sell(){
  balance += 100;

  const el = document.getElementById("balance");
  if(el) el.innerText = balance;

  addHistory("Sold BTC at " + price.toFixed(2));
}

// HISTORY
function addHistory(text){
  const div = document.getElementById("history");
  const p = document.createElement("p");
  p.innerText = text;
  div.prepend(p);
}
