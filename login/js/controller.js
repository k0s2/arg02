const buttonLogin = document.getElementById("button-login");
const areaInput = document.getElementById("login-input");
const areaMessage = document.getElementById("login-message");

buttonLogin.addEventListener("click", () => {

    areaInput.classList.add("hidden");
    areaMessage.classList.remove("hidden");

});