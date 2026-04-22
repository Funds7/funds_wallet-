// LOGIN FUNCTION
function login(){
  const user = document.getElementById("user").value.trim();

  if(!user){
    alert("Enter username");
    return;
  }

  localStorage.setItem("user", user);
  window.location.href = "./dashboard.html";
}

// RUN ON DASHBOARD
window.onload = function(){
  const user = localStorage.getItem("user");

  if (window.location.pathname.includes("dashboard.html")) {
    if (!user) {
      window.location.href = "./index.html";
    } else {
      document.getElementById("username").innerText = user;
    }
  }
}

// LOGOUT
function logout(){
  localStorage.removeItem("user");
  window.location.href = "./index.html";
}
