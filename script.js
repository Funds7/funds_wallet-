function login(){
  const user = document.getElementById("user").value.trim();

  if(!user || user.length < 3){
    alert("Username must be at least 3 characters");
    return;
  }

  // basic sanitization
  const safeUser = user.replace(/</g, "").replace(/>/g, "");

  sessionStorage.setItem("user", safeUser);
  sessionStorage.setItem("auth", "true");

  window.location.href = "./dashboard.html";
}

// RUN ON DASHBOARD
window.onload = function(){
  const auth = sessionStorage.getItem("auth");
  const user = sessionStorage.getItem("user");

  if(!auth || !user){
    window.location.replace("./index.html");
    return;
  }

  const el = document.getElementById("username");
  if(el) el.innerText = user;
}

// LOGOUT
function logout(){
  sessionStorage.clear();
  window.location.replace("./index.html");
}
