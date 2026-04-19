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
let user = localStorage.getItem("user");

// safer check (NOT relying on URL)
if(document.getElementById("balance")) {

  if(!user){
    window.location.href = "index.html";
  }

  document.getElementById("user").innerText = user;

  // SAFE BALANCE FIX (prevents NaN)
  let balance = localStorage.getItem(user+"_balance");

  if(balance === null || balance === "undefined" || isNaN(balance)){
    balance = 1000;
  }

  balance = parseFloat(balance);

  document.getElementById("balance").innerText = balance;

  function save(){
    localStorage.setItem(user+"_balance", balance);
  }

  function addHistory(text){
    let li = document.createElement("li");
    li.innerText = text;
    document.getElementById("history").appendChild(li);
  }

  window.buy = function(){
    let amt = parseFloat(document.getElementById("amount").value);

    if(isNaN(amt) || amt <= 0){
      alert("Enter valid amount");
      return;
    }

    if(amt > balance){
      alert("Not enough balance");
      return;
    }

    balance -= amt;
    document.getElementById("balance").innerText = balance;

    addHistory("BUY $" + amt);
    save();
  }

  window.sell = function(){
    let amt = parseFloat(document.getElementById("amount").value);

    if(isNaN(amt) || amt <= 0){
      alert("Enter valid amount");
      return;
    }

    balance += amt;
    document.getElementById("balance").innerText = balance;

    addHistory("SELL $" + amt);
    save();
  }

  window.logout = function(){
    localStorage.removeItem("user");
    window.location.href = "index.html";
  }
}
