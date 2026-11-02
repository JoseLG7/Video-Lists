"use strict";


// CRUD IndexedDB

const IDBRequest = indexedDB.open("list","2");

IDBRequest.addEventListener("upgradeneeded",()=>{
    const db = IDBRequest.result;
    let store;

    if (!db.objectStoreNames.contains("videos")) {
        store = db.createObjectStore("videos", { autoIncrement: true });
    } else {
        store = IDBRequest.transaction.objectStore("videos");
    }
    
    if (!store.indexNames.contains("search_title")) {
        store.createIndex("search_title", "title", { unique: false });
    }
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

const modifyObject = (key, object) => {
    return new Promise((resolve, reject) => {
        const db = IDBRequest.result;
        const transaction = db.transaction("videos", "readwrite");
        const store = transaction.objectStore("videos");
        
        const request = store.put(object, key);

        transaction.oncomplete = () => {
            console.log("Objeto modificado correctamente en la DB");
            resolve(); 
        };

        transaction.onerror = (error) => {
            console.error("Error al modificar:", error);
            reject(error);
        };
    });
}

const addObjectAfterShift = (data) => {
        return new Promise((resolve,reject) => {
        const db = IDBRequest.result;
        const transaction = db.transaction("videos", "readwrite");
        const objectStore = transaction.objectStore("videos");
        

        data.pos = parseInt(data.pos); 
        
        objectStore.add(data);
        
        transaction.oncomplete = () => {
            console.log("Video agregado correctamente");
            readObjects(); 
            showCorrectlyMessage();
            resolve();
    };
    transaction.onerror = () => {
            console.error("Error al agregar el objeto");
            reject(transaction.error); // 👈 Avisamos del error
        };
    });

}

const shiftPositionsAndAdd = (newVideoData) => {
    return new Promise((resolve, reject) => {
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

        transaction.oncomplete = async () => {
            console.log("Espacio liberado. Agregando nuevo video...");
            try {
                await addObjectAfterShift(newVideoData); 
                resolve();
            } catch (err) {
                reject(err);
            }
        };

        transaction.onerror = () => reject(transaction.error);
    });
};

const reorderVideos = (key, oldPos, newPos) => {
    return new Promise((resolve, reject) => {
        const db = IDBRequest.result;
        const transaction = db.transaction("videos", "readwrite");
        const store = transaction.objectStore("videos");

        oldPos = parseInt(oldPos);
        newPos = parseInt(newPos);

        const targetKey = isNaN(key) ? key : parseInt(key);

        const cursorRequest = store.openCursor();

        cursorRequest.onsuccess = (e) => {
            const cursor = e.target.result;
            if (cursor) {
                const video = cursor.value;
                const currentKey = cursor.primaryKey;
                let updateNeeded = false;
                if (currentKey === targetKey) { 
                    video.pos = newPos;
                    updateNeeded = true;
                }
                

                else if (oldPos < newPos) {
                    if (video.pos > oldPos && video.pos <= newPos) {
                        video.pos -= 1;
                        updateNeeded = true;
                    }
                }

                else if (oldPos > newPos) {
                    if (video.pos >= newPos && video.pos < oldPos) {
                        video.pos += 1;
                        updateNeeded = true;
                    }
                }

                if (updateNeeded) {
                    cursor.update(video);
                }
                
                cursor.continue();
            }
        };

        transaction.oncomplete = () => {
            console.log("Reordenamiento completado");
            resolve();
        };

        transaction.onerror = (err) => reject(err);
    });
};


const readObjects = (focusKey = null)=>{
    const IDBData = getIDBData("readonly");
    const cursor = IDBData.openCursor();
    const fragment = document.createDocumentFragment();
    const list = document.querySelector(".list-container__list");

    let videoArray = [];

    cursor.addEventListener("success",(e)=>{
        const cursor = e.target.result;

        if (cursor) {
            const currentKey = cursor.primaryKey;
            const data = cursor.value;
            videoArray.push({...data, keyDB: currentKey});
            cursor.continue();
        } else {
            videoArray.sort((a,b)=> a.pos - b.pos);

            //create HTML elements
            videoArray.forEach(video => {
                
                let listItem = addVideoToList(video.link, video.image, video.title, video.pos,video.keyDB);
                listItem.setAttribute("data-key", video.keyDB);
                fragment.appendChild(listItem);
            })
            list.innerHTML = "";
            list.appendChild(fragment);

            if (focusKey) {
                const targetElement = document.querySelector(`[data-key="${focusKey}"]`);

                if (targetElement) {
                    targetElement.scrollIntoView({ 
                        behavior: "smooth", 
                        block: "center" 
                    });

                    targetElement.classList.add("updated-flash");
                    setTimeout(() => {
                        targetElement.classList.remove("updated-flash");
                    }, 1500);
                }
            }
        }
    });
};

const deleteObject = (key, targetPos) => {
    return new Promise((resolve, reject) => {
        const db = IDBRequest.result;
        const transaction = db.transaction("videos", "readwrite");
        const objectStore = transaction.objectStore("videos");
        
        objectStore.delete(key);
        const cursorRequest = objectStore.openCursor();

        cursorRequest.onsuccess = (e) => {
            const cursor = e.target.result;
            if (cursor) {
                const video = cursor.value;
                if (video.pos >= targetPos) {
                    video.pos -= 1;
                    cursor.update(video);
                }
                cursor.continue();
            }
        };


        transaction.oncomplete = () => {
            console.log("Objeto borrado correctamente");
            resolve(); // Aquí el await se libera
        };

        transaction.onerror = () => {
            console.error("Error al borrar");
            reject(transaction.error);
        };
    });
};

const getListLength = () => {
    return new Promise((resolve, reject) => {
        const db = IDBRequest.result; 
        if (!db) return reject("La base de datos no está abierta");

        const transaction = db.transaction("videos", "readonly");
        const store = transaction.objectStore("videos");
        const request = store.count();

        request.onsuccess = () => {
            resolve(request.result); 
        };

        request.onerror = () => {
            reject("Error contando elementos");
        };
    });
};

const getPositionByKey = (key) => {
    return new Promise((resolve, reject) => {
        const db = IDBRequest.result;
        if (!db) return reject("La base de datos no está abierta");

        const transaction = db.transaction("videos", "readonly");
        const store = transaction.objectStore("videos");
        
        const targetKey = isNaN(key) ? key : parseInt(key);
        const request = store.get(targetKey);

        request.onsuccess = (e) => {
            const data = e.target.result;
            if (data) {
                resolve(data.pos);
            } else {
                reject("No se encontró ningún registro con esa key");
            }
        };

        request.onerror = (error) => {
            console.error("Error al buscar la posición por key:", error);
            reject(error);
        };
    });
};


//Search IndexedDB

const searchByTitle = (query) => {
    const IDBData = getIDBData("readonly");
    const cursorRequest = IDBData.openCursor();
    const list = document.querySelector(".list-container__list");
    
    list.innerHTML = ""; 
    
    // Creamos un array para guardar los resultados temporalmente
    const results = [];
    
    
    cursorRequest.onsuccess = (e) => {
        const cursor = e.target.result;
        if (cursor) {
            let lowerCaseTitle = cursor.value.title.toLowerCase();
            if (lowerCaseTitle.includes(query)) {
            results.push({
                ...cursor.value,
                key: cursor.primaryKey
            });
        }
            cursor.continue();
        } else {
            if (results.length > 0) {
                results.sort((a, b) => Number(a.pos) - Number(b.pos));

                const fragment = document.createDocumentFragment();
                
                results.forEach(video => {
                    const listItem = addVideoToList(
                        video.link, 
                        video.image, 
                        video.title, 
                        video.pos, 
                        video.key
                    );
                    fragment.appendChild(listItem);
                });

                list.appendChild(fragment);
            } else {
                switch (language) {
                    case "EN": list.innerHTML = `<p style='padding:20px; color: #555;'>No videos found with title: "${query}"</p>`;

                        break;
                    case "ES": list.innerHTML = `<p style='padding:20px; color: #555;'>No se encontró videos con ese titúlo: "${query}"</p>`;
                        break;
                }
            }
        }
    };
};


const searchByPosition = (targetPos) => {
    const IDBData = getIDBData("readonly");
    const cursorRequest = IDBData.openCursor();
    const list = document.querySelector(".list-container__list");
    
    list.innerHTML = "";

    cursorRequest.onsuccess = (e) => {
        const cursor = e.target.result;
        if (cursor) {
            if (Number(cursor.value.pos) === Number(targetPos)) {
                const video = cursor.value;
                const listItem = addVideoToList(video.link, video.image, video.title, video.pos, cursor.primaryKey);
                list.appendChild(listItem);
                return;
            }
            cursor.continue();
        } else if (list.innerHTML === "") {
            list.innerHTML = "<p style='padding:20px'>No video found in that position.</p>";
        }
    };
};


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

    const editButton = document.createElement("SPAN");
    editButton.classList.add("material-symbols-outlined");
    editButton.textContent = "Edit";

    const deleteButton = document.createElement("SPAN");
    deleteButton.classList.add("material-symbols-outlined");
    deleteButton.textContent = "Delete";

    const iconsContainer = document.createElement("DIV");
    iconsContainer.classList.add("li-container__icons");
    iconsContainer.appendChild(editButton);
    iconsContainer.appendChild(deleteButton);

    liContainer.appendChild(iconsContainer);
}


const addVideoToList = (link,image,title,pos,key=null)=> {
    const a = document.createElement("A");
    createLink(a,link,title);


    let imageUrl;

    if (typeof image !== "string") imageUrl = URL.createObjectURL(image)
    else imageUrl = image;

    const liContainerImage = document.createElement("DIV");
    createImageContainer(imageUrl,a,liContainerImage);

    const liContainerText = document.createElement("DIV");
    createTextContainer(liContainerText,title,pos);

    const liContainer = document.createElement("LI");
    createLiContainer(liContainer,liContainerImage,liContainerText);

    const iconsContainer = liContainer.lastElementChild;
    const editButton = iconsContainer.firstElementChild;
    const deleteButton = iconsContainer.lastElementChild;

    

    //edit

    editButton.addEventListener("click",()=>{

        //liContainer edit
        const language = localStorage.getItem("language");
        iconsContainer.style.display = "none";

        const changeLink = document.createElement("DIV");
        const changeLinkText = document.createTextNode("Link: ");
        const linkInput = document.createElement("INPUT");
        linkInput.classList.add("edit-buttons-input-link");
        linkInput.value = link;

        changeLink.appendChild(changeLinkText);
        changeLink.appendChild(linkInput);
        changeLink.classList.add("change-link");

        const dimmer = document.createElement("DIV");
        dimmer.classList.add("thumbnail-dimmer");

        const imageInput = document.createElement("input");
        imageInput.setAttribute("type","file");
        imageInput.setAttribute("accept","image/*");
        imageInput.classList.add("edit-image");
        imageInput.addEventListener("change",(e)=>{
            const file = e.target.files[0];
            if (file) {
                const previewUrl = URL.createObjectURL(file);
                liContainerImage.style.backgroundImage = `url("${previewUrl}")`;
            }
        })

        const imageLink = liContainerImage.firstElementChild;
        const upload = document.createElement("SPAN");
        upload.classList.add("material-symbols-outlined", "edit-icon-overlay");
        upload.textContent = "edit";

        liContainerImage.removeChild(imageLink);
        liContainerImage.appendChild(dimmer);
        liContainerImage.appendChild(upload);
        liContainerImage.appendChild(imageInput);
        liContainerImage.appendChild(changeLink);
        liContainerImage.style.setProperty('--hover-opacity', '1');

        let title = liContainerText.firstElementChild.textContent;
        let posLength = pos.toString().length;
        liContainerText.firstElementChild.textContent =  title.slice((3+posLength),title.length);
        liContainerText.setAttribute("contenteditable","true");

        const buttons = document.createElement("DIV");
        buttons.classList.add("edit-buttons-container");

        const textPos = document.createTextNode("Pos:");

        const posInput = document.createElement("INPUT");
        posInput.setAttribute("type","number");
        posInput.classList.add("edit-buttons-input");
        posInput.value = pos;

        const saveButton = document.createElement("BUTTON");
        saveButton.classList.add("edit-buttons-buttons");
        saveButton.classList.add("edit-buttons-save");
        switch (language) {
            case "EN": saveButton.textContent = "Save";
                break;
            case "ES": saveButton.textContent = "Guardar";
                break;
        }


        const cancelButton = document.createElement("BUTTON");
        cancelButton.classList.add("edit-buttons-buttons");
        cancelButton.classList.add("edit-buttons-cancel");
        switch (language) {
            case "EN": cancelButton.textContent = "Cancel";
                break;
            case "ES": cancelButton.textContent = "Cancelar";
                break;
        }

        buttons.appendChild(textPos);
        buttons.appendChild(posInput);
        buttons.appendChild(saveButton);
        buttons.appendChild(cancelButton);

        liContainer.appendChild(buttons);

        //cancelButton event

        cancelButton.addEventListener("click",()=>{
            liContainer.removeChild(buttons);

            liContainerText.setAttribute("contenteditable","false");
            liContainerText.firstElementChild.textContent =  title;

            liContainerImage.appendChild(imageLink);
            liContainerImage.removeChild(dimmer);
            liContainerImage.removeChild(upload);
            liContainerImage.removeChild(imageInput);
            liContainerImage.removeChild(changeLink);
            liContainerImage.style.setProperty('--hover-opacity', '0.7'); 

            iconsContainer.style.display = "flex";

            let originalUrl
            if (typeof image !== "string") {
                originalUrl = URL.createObjectURL(image);
            } else originalUrl = image;
            liContainerImage.style.backgroundImage = `url("${originalUrl}")`;
            imageInput.value = "";

        });

        //saveButton event

        saveButton.addEventListener("click",async()=>{
            let file = (imageInput.files.length > 0) ? imageInput.files[0] : image;
            const newPos = Number(posInput.value);

            const modifiedVideo = {
                    title: liContainerText.firstElementChild.textContent, 
                    link: linkInput.value, 
                    image: file, 
                    pos: newPos
                }

            console.log("Tipo de dato de pos:", typeof modifiedVideo.pos);

            const validationResult = await validateData(modifiedVideo.title,
                    modifiedVideo.link, 
                    modifiedVideo.image, 
                    modifiedVideo.pos);


            if (validationResult.isValid) {

                const oldPos = Number(pos);

                if (newPos === oldPos) {
                    await modifyObject(key,modifiedVideo);
                    if (imageInput.files.length > 0) {
                        const newUrl = URL.createObjectURL(modifiedVideo.image);
                        liContainerImage.style.backgroundImage = `url("${newUrl}")`;
                        image = modifiedVideo.image;
                    }

                    a.href = modifiedVideo.link;
                    link = modifiedVideo.link;

                    title = `#${modifiedVideo.pos}- ${modifiedVideo.title}`;
                    liContainerText.firstElementChild.textContent = title;

                    liContainer.classList.add("updated-flash");
                    setTimeout(() => {
                        liContainer.classList.remove("updated-flash");
                    }, 1500);



                    cancelButton.click();
                }
                else {
                    await reorderVideos(key, oldPos, newPos);
                    await modifyObject(key, modifiedVideo);
                    readObjects(key);
                }

                showCorrectlyMessage();

                    
            } else {showErrorMessage(validationResult.msg)
                console.log(validationResult.msg);
            };
        })

    });

    deleteButton.addEventListener("click", () => {
        keyToDelete = key;
        
        modalContainer.classList.add("modal-container-active");

        addVideoModal.style.display = "none";
        modalConfirm.style.display = "block"; 
    });

    return liContainer;

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

const modalMessage = document.querySelector(".modal-message");
const showCorrectlyMessage = ()=>{
    modalMessage.style.display = "flex";
    modalMessage.style.backgroundColor = "#28a745";
    const language = localStorage.getItem("language");
        switch (language) {
        case "EN":  modalMessage.firstElementChild.textContent = "Upload Correctly";
            break;
        case "ES": modalMessage.firstElementChild.textContent = "Subido Correctamente";
            break;
    }

    document.getElementById("modalIcon").textContent = "check_circle";
    setTimeout(() => {
        modalMessage.style.display = "none";
    }, 2000);
}

const showErrorMessage = (msg)=>{
    modalMessage.style.display="flex";
    modalMessage.style.backgroundColor = "red";
        const language = localStorage.getItem("language");
        switch (language) {
        case "EN": modalMessage.firstElementChild.textContent = `Upload Failed: ${msg}`;
            break;
        case "ES": modalMessage.firstElementChild.textContent = `Subida Fallida: ${msg}`;
            break;
    }

    document.getElementById("modalIcon").textContent = "error";
    setTimeout(() => {
        modalMessage.style.display = "none";
    }, 2000);

}

const showDeletedMessage = ()=>{
    modalMessage.style.display="flex";
    modalMessage.style.backgroundColor = "#28a745";
        const language = localStorage.getItem("language");
        switch (language) {
        case "EN": modalMessage.firstElementChild.textContent = `Deleted Correctly`;
            break;
        case "ES": modalMessage.firstElementChild.textContent = `Borrado Correctamente`;
            break;
    }

    document.getElementById("modalIcon").textContent = "check_circle";
    setTimeout(() => {
        modalMessage.style.display = "none";
    }, 2000);

}

//Validations

const validateLink = (link) =>{
    if (link.includes("youtube.com") ||
        link.includes("dailymotion.com") ||
        link.includes("vimeo.com") ||
        link.includes("facebook.com") ||
        link.includes("reddit.com")) {
            return true;
        }
        return false;
}

const validateImage = (file) => {
    return new Promise((resolve) => {

        if (typeof file == "string") {
            resolve(true);
        }

        if (!file || !file.type.startsWith('image/')) {
            resolve(false);
            return;
        }

        const img = new Image();
        const url = URL.createObjectURL(file);
        
        img.src = url;

        img.onload = function() {
            resolve(true);
            URL.revokeObjectURL(url); 
        };

        img.onerror = function() {
            resolve(false);
            URL.revokeObjectURL(url); 
        };
    });
};

const validateData = async (title,link,imageFile,pos)=> {
    let result = { isValid: false, msg: "" };
    const language = localStorage.getItem("language");
    if (title.length>5) {
        if (validateLink(link)) {
            const validImage = await validateImage(imageFile);
            if (validImage) {
                const listLength = await getListLength();
                if (pos>0 && pos<=(listLength+1)) return { isValid: true, msg: "Ok" };
                else {
                    switch (language) {
                    case "EN": result.msg = "The position is not valid";
                        break;
                    case "ES": result.msg = "La posición no es valida";
                        break;
                    }
                }
            } else {
                    switch (language) {
                    case "EN": result.msg = "The image is not valid";
                        break;
                    case "ES": result.msg = "La imagen no es valida";
                        break;
                }
            }
        } else {
            switch (language) {
                    case "EN": result.msg = "The link is not valid";
                        break;
                    case "ES": result.msg = "El link no es válido";
                        break;
                }
        }
    } else { switch (language) {
                    case "EN": result.msg = "The title is too short";
                        break;
                    case "ES": result.msg = "El título es muy corto";
                        break;
                }
            };

    return result;
    
}


//Upload a video

const uploadData= async (e)=>{
    e.preventDefault();
    const file = inputImage.files[0];
    const validationResult= await validateData(inputTitle.value,inputLink.value,file,inputPos.value);
    if (validationResult.isValid){
        const newVideo = {
            title: inputTitle.value, 
            link: inputLink.value, 
            image: file, 
            pos: inputPos.value
        }
        await shiftPositionsAndAdd(newVideo);
        showCorrectlyMessage();
    } else showErrorMessage(validationResult.msg); 

}

submitButton.addEventListener("click",uploadData);



//Modals
const modalContainer = document.querySelector(".modal-container");


//Add Modal
const openModal=(e)=>{
    e.preventDefault();
    modalContainer.classList.add("modal-container-active");
    addVideoModal.style.display = "block"; 
    modalConfirm.style.display = "none";
}

const addButton = document.querySelector(".aside__button");

addButton.addEventListener("click",openModal);


const closeButton = document.querySelector(".close-button");

const closeModal=()=>{
    closeAllModals();
    modalMessage.style.display="none";
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


//deleteModal

let keyToDelete = null;

const modalConfirm = document.querySelector(".modal-confirm");
const btnYes = document.getElementById("btnYes");
const btnNo = document.getElementById("btnNo");
const addVideoModal = document.querySelector(".modal");


const closeConfirmModal = () => {
    modalContainer.style.display = "none";
    modalConfirm.style.display = "none";
    keyToDelete = null;
};

const closeAllModals = () => {
    modalContainer.classList.remove("modal-container-active");
    addVideoModal.style.display = "block"; 
    modalConfirm.style.display = "none";
    keyToDelete = null;
};

    btnYes.addEventListener("click", async () => {
        if (keyToDelete !== null) {
            let targetPos = await getPositionByKey(keyToDelete)
            await deleteObject(keyToDelete, targetPos);
            readObjects();
            showDeletedMessage();
            
            closeConfirmModal();
        }
    });

    btnNo.addEventListener("click", () => {
        closeAllModals();
    });

    addButton.addEventListener("click", (e) => {
    openModal(e);
    addVideoModal.style.display = "block";
    modalConfirm.style.display = "none";   
});


//Search a video

const searchTitleInput= document.getElementById("searchTitleInput");
const searchPosInput = document.getElementById("searchPosInput");

const searchTitleButton = document.getElementById("searchTitleButton");
const searchPosButton = document.getElementById("searchPosButton");

searchTitleButton.addEventListener("click",()=>{
    const query = searchTitleInput.value.trim();
    if (query !== "") searchByTitle(query.toLowerCase());
    searchPosInput.value="";
})

searchPosButton.addEventListener("click",()=>{
    const pos = searchPosInput.value;
    if (pos !== "") searchByPosition(pos);
    searchTitleInput.value="";
})

