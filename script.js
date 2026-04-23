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

  // basic sanitization
  const safeUser = user.replace(/</g, "").replace(/>/g, "");

  sessionStorage.setItem("user", safeUser);
  sessionStorage.setItem("auth", "true");

  window.location.href = "./dashboard.html";
}

// RUN ON DASHBOARD
window.onload = function(){
  const auth = localStorage.getItem("auth");
  const user = localStorage.getItem("user");

  if(auth !== "true" || !user){
    window.location.replace("./index.html");
    return;
  }

  const el = document.getElementById("username");
  if(el) el.innerText = user;
}

  const el = document.getElementById("username");
  if(el) el.innerText = user;
}

// LOGOUT
function logout(){
  localStorage.clear();
  window.location.replace("./index.html");
}
