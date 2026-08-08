const loginForm = document.getElementById("loginForm");
const passwordInput = document.getElementById("password");
const passwordToggle = document.getElementById("passwordToggle");
const passwordToggleLabel = document.getElementById("passwordToggle");
const statusMessage = document.getElementById("statusMessage");
const loginButton = document.getElementById("loginButton");
const forgotButton = document.getElementById("forgotBtn");
const createButton = document.getElementById("createButton");

passwordToggle.addEventListener("click", () => {
  const isPassword = passwordInput.type === "password";

  passwordInput.type = isPassword ? "text" : "password";

  passwordToggle.setAttribute(
    "aria-label",
    isPassword ? "Hide password" : "Show password"
  );
});

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = passwordInput.value;

  if (!email || !password) {
    showStatus("Please fill in all fields.");
    return;
  }

  setLoading(true);

  /*
    Backend authentication will be connected here later.

    Example future request:

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email,
        password
      })
    });
  */

  setTimeout(() => {
    setLoading(false);

    showStatus(
      "Authentication backend is not connected yet."
    );
  }, 700);
});

forgotButton.addEventListener("click", () => {
  showStatus("Password recovery will be added later.");
});

createButton.addEventListener("click", () => {
  showStatus("Account registration will be added later.");
});

function showStatus(message) {
  statusMessage.textContent = message;
}

function setLoading(loading) {
  loginButton.disabled = loading;

  if (loading) {
    loginButton.querySelector("span").textContent = "CONNECTING...";
    loginButton.style.opacity = "0.65";
  } else {
    loginButton.querySelector("span").textContent = "LOGIN";
    loginButton.style.opacity = "1";
  }
}