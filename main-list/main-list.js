"use strict";


// CRUD IndexedDB

const IDBRequest = indexedDB.open("list","1");

IDBRequest.addEventListener("upgradeneeded",()=>{
    const db = IDBRequest.result;
    db.createObjectStore("videos",{
        autoIncrement: true
    });
});

IDBRequest.addEventListener("success",()=>{
    readObjects();
    console.log("todo salio correctamente");
}
);

IDBRequest.addEventListener("error",()=>{
    console.log("ocurrio un error al abrir la base de datos");
});

const getIDBData =  (mode,msg)=>{
    const db = IDBRequest.result;
    const IDBtransaction = db.transaction("videos",mode);
    const objectStore = IDBtransaction.objectStore("videos");
    IDBtransaction.addEventListener("complete",()=>{
        console.log(msg);
    })
    return objectStore;
}

const addObject = (object)=>{
    const IDBData = getIDBData("readwrite","objeto agregado correctamente");
    IDBData.add(object);
}

const modifyObject = (key,object)=>{
    const IDBData = getIDBData("readwrite","objeto modificado correctamente");
    IDBData.put(object,key);
}

const addObjectAfterShift = (data) => {
    const db = IDBRequest.result;
    const transaction = db.transaction("videos", "readwrite");
    const objectStore = transaction.objectStore("videos");
    

    data.pos = parseInt(data.pos); 
    
    objectStore.add(data);
    
    transaction.oncomplete = () => {
        console.log("Video agregado correctamente");
        readObjects(); 
        showCorrectlyMessage();
    }
}

const shiftPositionsAndAdd = (newVideoData) => {
    const db = IDBRequest.result;
    const transaction = db.transaction("videos", "readwrite");
    const objectStore = transaction.objectStore("videos");
    const targetPos = parseInt(newVideoData.pos); 

    
    const cursorRequest = objectStore.openCursor();

    cursorRequest.onsuccess = (e) => {
        const cursor = e.target.result;
        if (cursor) {
            const video = cursor.value;
            if (video.pos >= targetPos) {
                video.pos += 1; 
                cursor.update(video); 
            }
            cursor.continue();
        }
    };

    transaction.oncomplete = () => {
        console.log("Espacio liberado. Agregando nuevo video...");
        addObjectAfterShift(newVideoData);
    };
    
    transaction.onerror = () => console.log("Error al desplazar elementos");
};

const readObjects = ()=>{
    const IDBData = getIDBData("readonly");
    const cursor = IDBData.openCursor();
    const fragment = document.createDocumentFragment();
    const list = document.querySelector(".list-container__list");
    list.innerHTML="";
    let videoArray = [];

    cursor.addEventListener("success",()=>{
        if (cursor.result) {
            videoArray.push(cursor.result.value);
            cursor.result.continue();
        } else {
            videoArray.sort((a,b)=> a.pos - b.pos);

            //create HTML elements
            videoArray.forEach(video => {
                let imageUrl;
                if (typeof video.image !== "string") {
                    imageUrl = URL.createObjectURL(video.image);
                } else imageUrl = video.image;
                let listItem = addVideoToList(video.link, imageUrl, video.title, video.pos);
                fragment.appendChild(listItem);
            })
            list.appendChild(fragment);
        }
    });
}

const deleteObject = (key)=>{
    const IDBData = getIDBData("readwrite","objeto borrado correctamente");
    IDBData.delete(key);
}




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

function createTextContainer(liContainerText,title,pos){
    const h2 = document.createElement("H2");
    h2.textContent= `#${pos}- ${title}`;
    liContainerText.classList.add("li-container__text");
    liContainerText.appendChild(h2);

}

function createLiContainer(liContainer,liContainerImage,liContainerText) {
    liContainer.classList.add("list-container__li-container");
    liContainer.appendChild(liContainerImage);
    liContainer.appendChild(liContainerText);
}


function addVideoToList(link,image,title,pos) {
    const a = document.createElement("A");
    createLink(a,link,title);

    const liContainerImage = document.createElement("DIV");
    createImageContainer(image,a,liContainerImage);

    const liContainerText = document.createElement("DIV");
    createTextContainer(liContainerText,title,pos);

    const liContainer = document.createElement("LI");
    createLiContainer(liContainer,liContainerImage,liContainerText);

    return liContainer;

    /*const list = document.querySelector(".list-container__list");
    list.appendChild(liContainer);*/

}

const label = document.querySelector('label[for="image"]');


const image = document.getElementById("image");
image.onchange= function () {
  // Cambiamos el texto del label por el nombre del archivo seleccionado
    label.innerText = this.files[0].name;
};

const inputTitle = document.getElementById("title");
const inputLink = document.getElementById("link");
const inputImage = document.getElementById("image");
const inputPos = document.getElementById("position");


const submitButton = document.querySelector(".form__input-submit");

const modalCorrectlyMessage = document.querySelector(".modal-correct-message");
const showCorrectlyMessage = ()=>{
    modalCorrectlyMessage.style.display="flex";
}

//Validations

const validateLink = (link) =>{
    if (link.includes("youtube.com") ||
        link.includes("dailymotion.com") ||
        link.includes("vimeo.com") ||
        link.includes("facebook.com")) {
            return true;
        }
        return false;
}

const validateImage = (file) => {
    return new Promise((resolve) => {
        // Si no hay archivo o no es tipo imagen, rechazamos rápido
        if (!file || !file.type.startsWith('image/')) {
            resolve(false);
            return;
        }

        const img = new Image();
        const url = URL.createObjectURL(file);
        
        img.src = url;

        // Si carga bien, devolvemos TRUE
        img.onload = function() {
            resolve(true);
            URL.revokeObjectURL(url); // Limpiamos memoria
        };

        // Si falla (es un archivo corrupto o falso), devolvemos FALSE
        img.onerror = function() {
            resolve(false);
            URL.revokeObjectURL(url); // Limpiamos memoria
        };
    });
};

const validateData = async (title,link,imageFile)=> {
    if (title.length>5) {
        if (validateLink(link)) {
            const validImage = await validateImage(imageFile);
            if (validImage) {
                return true;
            }
        }
    }
    return false;
}


//Upload a video

const uploadData= async (e)=>{
    e.preventDefault();
    const file = inputImage.files[0];
    const isValid = await validateData(inputTitle.value,inputLink.value,file);
    if (isValid){
        const newVideo = {
            title: inputTitle.value, 
            link: inputLink.value, 
            image: file, 
            pos: inputPos.value
        }
        shiftPositionsAndAdd(newVideo);
        showCorrectlyMessage();
    } else console.log("hubo un error"); 

}

submitButton.addEventListener("click",uploadData);



//Open Modal

const modalContainer = document.querySelector(".modal-container");

const openModal=(e)=>{
    e.preventDefault();
    //modalContainer.style.display="flex";
    modalContainer.classList.add("modal-container-active");
}

const addButton = document.querySelector(".aside__button");

addButton.addEventListener("click",openModal);

//Close Modal

const closeButton = document.querySelector(".close-button");

const closeModal=()=>{
    modalContainer.classList.remove("modal-container-active");
    modalCorrectlyMessage.style.display="none";
    inputTitle.value="";
    inputLink.value="";
    inputImage.value=[];
    const language = localStorage.getItem("language");
    switch (language) {
        case "EN": label.innerText = "Select File";
            break;
        case "ES": label.innerText = "Seleccionar Archivo"
            break;
    }


}

closeButton.addEventListener("click",closeModal);


//flow



