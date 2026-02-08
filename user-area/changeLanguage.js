"use strict"

//Change Language


const changeToSpanish = ()=>{
    const userArea = document.getElementById("userArea");
    const mainList = document.getElementById("mainList");
    const mainTitle = document.getElementById("container__main-title");
    const loginHeader = document.getElementById("loginHeader")
    const loginText = document.getElementById("loginText");
    const loginUsername = document.getElementById("loginUsername");
    const loginPassword = document.getElementById("loginPassword");
    const loginButton = document.getElementById("loginButton");
    const registerHeader = document.getElementById("registerHeader")
    const registerText = document.getElementById("registerText");
    const registerUsername = document.getElementById("registerUsername");
    const registerPassword = document.getElementById("registerPassword");
    const registerRepeatPassword = document.getElementById("registerRepeatPassword");
    const registerButton = document.getElementById("registerButton");


    userArea.textContent = "Area de Usuarios";
    mainList.textContent = "Lista Principal de Openings de Anime";
    mainTitle.textContent = "Cuenta Woodlists";
    loginHeader.textContent = "Loguearse";
    loginText.textContent = "Logearse en una cuenta existente de Woodlists. Tienes 3 intentos cada 30 minutos. Si no tienes una cuenta registrate a la derecha o debajo.";
    loginUsername.textContent = "Nombre de usuario:"
    loginPassword.textContent = "Contraseña:";
    loginButton.value = "Loguearse";
    registerHeader.textContent = "Registrarse";
    registerText.textContent = "¿Todavia no te registraste?. Crea una nueva cuenta de Woodlists debajo";
    registerUsername.textContent = "Nombre de usuario:"
    registerPassword.textContent = "Contraseña";
    registerRepeatPassword.textContent = "Repetir Contraseña";
    registerButton.value = "Registrarse";


}

const changeToEnglish = ()=>{
    const userArea = document.getElementById("userArea");
    const mainList = document.getElementById("mainList");
    const mainTitle = document.getElementById("container__main-title");
    const loginHeader = document.getElementById("loginHeader")
    const loginText = document.getElementById("loginText");
    const loginUsername = document.getElementById("loginUsername");
    const loginPassword = document.getElementById("loginPassword");
    const loginButton = document.getElementById("loginButton");
    const registerHeader = document.getElementById("registerHeader")
    const registerText = document.getElementById("registerText");
    const registerUsername = document.getElementById("registerUsername");
    const registerPassword = document.getElementById("registerPassword");
    const registerRepeatPassword = document.getElementById("registerRepeatPassword");
    const registerButton = document.getElementById("registerButton");


    userArea.textContent = "Woodlists User Area";
    mainList.textContent = "Anime Openings Main List";
    mainTitle.textContent = "Woodlists Account";
    loginHeader.textContent = "Login";
    loginText.textContent = "Log in to an existing Woodlists account. You have 3 login attempts by 30 minutes. If you do not have an account yet, register on the right or below.";
    loginUsername.textContent = "Username:"
    loginPassword.textContent = "Password:";
    loginButton.value = "Log In";
    registerHeader.textContent = "Register";
    registerText.textContent = "¿Not registered yet? Create a new Woodlists account below.";
    registerUsername.textContent = "Username:"
    registerPassword.textContent = "Password";
    registerRepeatPassword.textContent = "Repeat Password:";
    registerButton.value = "Register";


}

const changeLanguage = (language) =>{
    switch (language) {
        case "EN": changeToEnglish();
            break;
        case "ES": changeToSpanish();
            break;
    }
}

const language = localStorage.getItem("language");



const languageChanger = document.getElementById("language");

if (language !== null) {
    changeLanguage(language);
    languageChanger.value = language;
}

languageChanger.addEventListener("change",(e)=>{
    localStorage.setItem("language",e.target.value);
    changeLanguage(e.target.value);
})