let videoElement = document.querySelector("#camara");
let botonTomarFoto = document.querySelector("#tomar-foto");
let botonBorrarTodo = document.querySelector("#borrar-todo");
let galeriaFotos = document.querySelector("#galeria");

// solicitar acceso a la cámara
navigator.mediaDevices.getUserMedia({ video: true }).then(stream => { videoElement.srcObject = stream })
    .catch(error => {
        alert("Error al acceder a la cámara" + error);
    });
// declaracion del contador de fotos para generar el id y poder borrar o descargar
let contadorIDfotos = getNextPhoto();

// cuando se pulsa click en tomar foto, se genera un canvas de tipo 2d, con las coordenadas x,y de la imagen que se esta transmitiendo
botonTomarFoto.addEventListener("click", () => {
    let canvas = document.createElement("canvas");
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    const context = canvas.getContext("2d");

    // dibuja con todos los datos anteriores
    context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

    // galeriaFotos.appendChild(canvas); -> solo para probar

    // convertir el canva a base64

    let dataUrl = canvas.toDataURL("image/jpeg", 0.9); // le indicamos que convierta el canva a una imagen con la ruta que vamos a establecer con el id
    let photoID = contadorIDfotos++;
    guardarFoto({ id: photoID, dataUrl }); // clave:valor -> mapa con el id y la ruta para guardarlo luego en el localStorage del navegador
    setNextPhoto(contadorIDfotos); // se pasa el valor del contador de foto a una funcion que prepara para la proxima foto el contador
});

function guardarFoto(photo, isPhotoLoad = false) {
    // creamos el contenedor para la foto 
    let photoContainer = document.createElement("div");
    photoContainer.className = "photo-container";
    photoContainer.dataset.id = photo.id;

    // crear la imagen
    let img = new Image(); // esta variable es de tipo objeto de imagen
    img.src = photo.dataUrl;
    img.className = "photo";

    // crear el contenedor para los botones
    let contenedorBotones = document.createElement("div");
    contenedorBotones.className = "botones-photo";

    // creamos el boton de eliminar
    eliminarPhoto = document.createElement("button");
    eliminarPhoto.className = "boton-eliminar";
    eliminarPhoto.textContent = "Eliminar";

    // crear el evento si pulsas click en eliminar
    eliminarPhoto.addEventListener("click", () => {
        eliminar(photo.id);
    })

    // creamos el boton de descargar
    let descargarPhoto = document.createElement("button");
    descargarPhoto.className = "boton-descargar";
    descargarPhoto.textContent = "Descargar";
    // creamos el evento si pulsas click en descargar
    descargarPhoto.addEventListener("click", () => {
        descargar(photo.dataUrl,`photo-${photo.id}.jpg`)
    });

    galeriaFotos.appendChild(photoContainer);
    photoContainer.appendChild(img);
    photoContainer.appendChild(contenedorBotones);
    contenedorBotones.appendChild(eliminarPhoto);
    contenedorBotones.appendChild(descargarPhoto);

    // guardar la imagen en el almacenamiento local solo si no está cargado desde localStorage
    if (!isPhotoLoad) {
        let fotos = JSON.parse(localStorage.getItem("fotos")) || [];
        fotos.push(photo);
        localStorage.setItem("fotos", JSON.stringify(fotos));
    }
}

function eliminar(id) {
    let divEliminar = document.querySelector(`.photo-container[data-id="${id}"]`);

    if (divEliminar) {
        galeriaFotos.removeChild(divEliminar);
    }

    // eliminar del localstorage, se leen todas las fotos que estan guardadas y se filtra el que sea igual al id que se busca
    // || [] -> si en fotos no existe nada o es nulo, devuelve un array vacio
    let fotos=JSON.parse(localStorage.getItem("fotos")) || []; 
    fotos=fotos.filter(photo=>photo.id != id);
    localStorage.setItem("fotos",JSON.stringify(fotos));
}

function descargar(dataUrl,filename){
    let elemento=document.createElement("a"); // enlace tipo file
    elemento.href=dataUrl;
    elemento.download=filename;
    document.body.appendChild(elemento);
    elemento.click(); 
    document.body.removeChild(elemento);
}

function getNextPhoto() {
    return parseInt(localStorage.getItem("contadorIDFotos")) || 0;
}

function setNextPhoto(id) {
    localStorage.setItem("contadorIDfotos",id.toString)
}

botonBorrarTodo.addEventListener("click",()=>{
    localStorage.removeItem("fotos"); //eliminamos todo del localstorage
    while(galeriaFotos.firstChild){
        galeriaFotos.removeChild(galeriaFotos.firstChild);
    }
    // inicializamos el contador 
    contadorIDfotos=0;
    // inicializamos el localStorage
    setNextPhoto(contadorIDfotos);
})

// cuando carga la pagina debe recuperar todas las fotos
//  lee el localStorage y muestra las fotos que estén almacenadas
let fotosGuardadas = JSON.parse(localStorage.getItem("fotos")) || [];
fotosGuardadas.forEach(element => {
    guardarFoto(element, true); //el true hace referencia que si es leido, o tiene contenido

});



