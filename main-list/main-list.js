// Add a video

function createLink(a,link,title) {
    a.setAttribute("href",link);
    a.setAttribute("target","_blank");
    a.setAttribute("rel","noopener noreferrer nofollow");
    a.setAttribute("aria-label","Link that opens a new tab to "+title);
    a.classList.add("li-thumbnail__link");
}

function createImageContainer(image,a,liContainerImage) {
    liContainerImage.classList.add("li-container__li-thumbnail");
    liContainerImage.style.backgroundImage= `url("${image}")`;
    liContainerImage.appendChild(a);
}

function createTextContainer(liContainerText,title){
    const h2 = document.createElement("H2");
    h2.textContent= "#?- "+title;
    liContainerText.classList.add("li-container__text");
    liContainerText.appendChild(h2);

}

function createLiContainer(liContainer,liContainerImage,liContainerText) {
    liContainer.classList.add("list-container__li-container");
    liContainer.appendChild(liContainerImage);
    liContainer.appendChild(liContainerText);
}


function addVideoToList(link,image,title) {
    const a = document.createElement("A");
    createLink(a,link,title);

    const liContainerImage = document.createElement("DIV");
    createImageContainer(image,a,liContainerImage);

    const liContainerText = document.createElement("DIV");
    createTextContainer(liContainerText,title);

    const liContainer = document.createElement("LI");
    createLiContainer(liContainer,liContainerImage,liContainerText);

    const list = document.querySelector(".list-container__list");
    list.appendChild(liContainer);

}

const inputTitle = document.getElementById("title");
const inputLink = document.getElementById("link");
const inputImage = document.getElementById("image");

const submitButton = document.querySelector(".form__input-submit");

const uploadData=(e)=>{
    e.preventDefault();
    const file = inputImage.files[0]; 
    console.log(file)
    // 2. Creamos una URL temporal que el navegador sí entienda
    const imageURL = URL.createObjectURL(file);
    console.log(imageUrl)
    addVideoToList(inputLink.value,inputImage.value,imageURL);

}

submitButton.addEventListener("click",uploadData);



//Open Modal

const modalContainer = document.querySelector(".modal-container");

const openModal=(e)=>{
    e.preventDefault();
    modalContainer.style.display="flex";
}

const addButton = document.querySelector(".aside__button");

addButton.addEventListener("click",openModal);

//Close Modal

const closeButton = document.querySelector(".close-button");

const closeModal=()=>{
    modalContainer.style.display="none";
}

closeButton.addEventListener("click",closeModal);


