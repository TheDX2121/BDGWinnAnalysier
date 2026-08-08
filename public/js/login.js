const loginForm =
  document.getElementById(
    "loginForm"
  );

const loginButton =
  document.getElementById(
    "loginButton"
  );

const loginMessage =
  document.getElementById(
    "loginMessage"
  );

loginForm.addEventListener(
  "submit",
  async event => {
    event.preventDefault();

    const email =
      document
        .getElementById("email")
        .value
        .trim();

    const password =
      document
        .getElementById("password")
        .value;

    loginMessage.textContent = "";

    loginButton.disabled = true;

    try {
      const data =
        await API.post(
          "/api/auth/login",
          {
            email,
            password
          }
        );

      localStorage.setItem(
        "analyzer_token",
        data.token
      );

      location.href =
        "/dashboard";

    } catch (error) {
      loginMessage.textContent =
        error.message;

    } finally {
      loginButton.disabled = false;
    }
  }
);