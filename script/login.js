const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const loginBtn = document.getElementById("loginBtn");
const errorMsg = document.getElementById("errorMsg");

loginBtn.addEventListener("click", function () {

  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();

  // Demo credentials
  const validUsername = "admin";
  const validPassword = "admin123";

  if (username === validUsername && password === validPassword) {

    // Save login state
    localStorage.setItem("isLoggedIn", "true");

    // Redirect
    window.location.href = "./main.html";

  } else {

    errorMsg.classList.remove("hidden");

  }

});