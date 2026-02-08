"use strict"

//Change Language


const changeToSpanish = ()=>{
    const userArea = document.getElementById("userArea");
    const mainList = document.getElementById("mainList");
    const secondaryTitle = document.querySelector(".description__secondary-title");
    const description = document.querySelector(".description__description");
    const buttonText = document.getElementById("button-section__button-list");

    userArea.textContent = "Area de Usuarios";
    mainList.textContent = "Lista Principal de Openings de Anime";
    secondaryTitle.textContent = "Propósito";
    description.textContent = "Woodlist es una página donde podes crear tus propios rankings de video y ver rankings de otros usuarios";
    buttonText.textContent = "Ir a la lista principal";

}

const changeToEnglish = ()=>{
    const userArea = document.getElementById("userArea");
    const mainList = document.getElementById("mainList");
    const secondaryTitle = document.querySelector(".description__secondary-title");
    const description = document.querySelector(".description__description");
    const buttonText = document.getElementById("button-section__button-list");

    userArea.textContent = "Woodlists User Area";
    mainList.textContent = "Anime Openings Main List";
    secondaryTitle.textContent = "Purpose";
    description.textContent = "Woodlists is a page where you can create your own video rankings and view rankings from others users";
    buttonText.textContent = "Go to main list";

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