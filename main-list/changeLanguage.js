"use strict"

//Change Language


const changeToSpanish = ()=>{
    const userArea = document.getElementById("userArea");
    const mainList = document.getElementById("mainList");
    const addButton = document.getElementById("aside__button-list");
    const modalHeader = document.getElementById("modalHeader");
    const modalTitle = document.getElementById("modalTitle");
    const modalLink = document.getElementById("modalLink");
    const modalImg = document.getElementById("modalImg");
    const modalAddButton = document.querySelector(".form__input-submit");
    const modalPosition = document.getElementById("modalPos");
    const label = document.querySelector('label[for="image"]');


    userArea.textContent = "Area de Usuarios";
    mainList.textContent = "Lista Principal de Openings de Anime";
    addButton.textContent = "Añadir";
    modalHeader.textContent = "Añadir un video";
    modalTitle.firstChild.textContent = "Título:";
    modalLink.firstChild.textContent = "Link:";
    modalImg.firstChild.textContent = "Img:";
    modalAddButton.value = "Agregar";
    modalPosition.firstChild.textContent = "Pos:"
    label.innerText = "Seleccionar Archivo";

}

const changeToEnglish = ()=>{
    const userArea = document.getElementById("userArea");
    const mainList = document.getElementById("mainList");
    const addButton = document.getElementById("aside__button-list");
    const modalHeader = document.getElementById("modalHeader");
    const modalTitle = document.getElementById("modalTitle");
    const modalLink = document.getElementById("modalLink");
    const modalImg = document.getElementById("modalImg");
    const modalAddButton = document.querySelector(".form__input-submit");
    const modalPosition = document.getElementById("modalPos");
    const label = document.querySelector('label[for="image"]');


    userArea.textContent = "Woodlists User Area";
    mainList.textContent = "Anime Openings Main List";
    addButton.textContent = "Add";
    modalHeader.textContent = "Add a video";
    modalTitle.firstChild.textContent = "Title:";
    modalLink.firstChild.textContent = "Link:";
    modalImg.firstChild.textContent = "Img:";
    modalAddButton.value = "Add";
    modalPosition.firstChild.textContent = "Pos:"
    label.innerText = "Select File";

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