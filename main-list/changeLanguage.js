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
    const deleteConfirmText = document.getElementById("confirmText");
    const deleteConfirmAction = document.getElementById("confirmAction");
    const deleteBtnYes = document.getElementById("btnYes");
    const deleteBtnNo = document.getElementById("btnNo");
    const titleSearch = document.getElementById("titleSearch");
    const positionSearch = document.getElementById("positionSearch");


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
    deleteConfirmAction.innerText = "Confirmar Acción";
    deleteConfirmText.innerText = "¿Estás seguro de borrar este video de la lista?";
    deleteBtnYes.innerText = "Si, Borrar";
    deleteBtnNo.innerText = "No, Cancelar";
    titleSearch.textContent = "Buscar por titúlo";
    positionSearch.textContent = "Buscar por posición:"

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
    const deleteConfirmAction = document.getElementById("confirmAction");
    const deleteConfirmText = document.getElementById("confirmText");
    const deleteBtnYes = document.getElementById("btnYes");
    const deleteBtnNo = document.getElementById("btnNo");
    const titleSearch = document.getElementById("titleSearch");
    const positionSearch = document.getElementById("positionSearch");



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
    deleteConfirmAction.innerText = "Confirm Action";
    deleteConfirmText.innerText = "Are you sure to remove this video from the list?";
    deleteBtnYes.innerText = "Yes, Delete";
    deleteBtnNo.innerText = "No, Cancel";
    titleSearch.textContent = "Search by title:";
    positionSearch.textContent = "Search by position:"

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