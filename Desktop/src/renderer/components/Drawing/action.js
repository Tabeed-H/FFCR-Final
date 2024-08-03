let selectedValue = "Default";

document.addEventListener("DOMContentLoaded", function () {
  var dropdownButton = document.getElementById("dropvalue");
  var dropdownContent = document.getElementById("dropdown-content");
  dropdownContent.addEventListener("click", function (event) {
    event.preventDefault();
    selectedValue = event.target.dataset.value;

    dropdownButton.textContent = `${selectedValue}`;

    const rightContainer = document.querySelector(".right");
    rightContainer.innerHTML = "";

    console.log("Selected value:", selectedValue);
  });
});

document.querySelectorAll(".component").forEach((component) => {
  component.addEventListener("click", () => {
    const componentId = component.id;
    const rightContainer = document.querySelector(".right");
    console.log(componentId);
    displayImagesForComponent(componentId, selectedValue);
  });
});

// Function to load and display images for the selected component
async function displayImagesForComponent(componentId, resourcePack) {
  const rightContainer = document.querySelector(".right");

  rightContainer.innerHTML = "";

  const componentFolderPath = `assets/${resourcePack}/${componentId}`;

  try {
    const fileList = await window.electronAPI.getFileList(componentFolderPath);
    displayImages(fileList, componentId, resourcePack);
  } catch (error) {
    console.error("Error getting file list:", error);
  }
}

function displayImages(fileList, componentId, resourcePack) {
  const rightContainer = document.querySelector(".right");
  rightContainer.innerHTML = "";
  fileList.forEach((fileName) => {
    const imgElement = document.createElement("img");
    imgElement.src = `file:///assets/${resourcePack}/${componentId}/${fileName}`;
    imgElement.draggable = true;
    imgElement.className = "dragImg";
    imgElement.id = `${componentId}-${fileName}`;
    rightContainer.appendChild(imgElement);
  });

  var images = document.querySelectorAll(".dragImg");
  [].forEach.call(images, function (img) {
    console.log(images);
    img.addEventListener("dragstart", handleDragStart, false);
    img.addEventListener("dragend", handleDragEnd, false);
  });

  var canvasContainer = document.getElementById("canvas-container");
  canvasContainer.addEventListener("dragenter", handleDragEnter, false);
  canvasContainer.addEventListener("dragover", handleDragOver, false);
  canvasContainer.addEventListener("dragleave", handleDragLeave, false);
  canvasContainer.addEventListener("drop", handleDrop, false);
}

// ----------------------------------------------------------------------------------------------------------------------------
//                                        FABRIC.JS CANVAS CODE
// ----------------------------------------------------------------------------------------------------------------------------
// NOTE: Donot remove or change anything
// ---------------------------------------------------------------------------------------------------------------------------

var canvas = new fabric.Canvas("canvas");

/* 
NOTE: the start and end handlers are events for the <img> elements; the rest are bound to 
the canvas container.
*/

function handleDragStart(e) {
  [].forEach.call(images, function (img) {
    img.classList.remove("img_dragging");
  });
  this.classList.add("img_dragging");
}

function handleDragOver(e) {
  if (e.preventDefault) {
    e.preventDefault(); // Necessary. Allows us to drop.
  }

  e.dataTransfer.dropEffect = "copy"; // See the section on the DataTransfer object.
  // NOTE: comment above refers to the article (see top) -natchiketa

  return false;
}

function handleDragEnter(e) {
  // this / e.target is the current hover target.
  this.classList.add("over");
}

function handleDragLeave(e) {
  this.classList.remove("over"); // this / e.target is previous target element.
}

function handleDrop(e) {
  // this / e.target is current target element.

  if (e.stopPropagation) {
    e.stopPropagation(); // stops the browser from redirecting.
  }

  var img = document.querySelector("#images img.img_dragging");

  console.log("event: ", e);

  var newImage = new fabric.Image(img, {
    // width: img.width,
    // height: img.height,
    // Set the center of the new object based on the event coordinates relative
    // to the canvas container.
    left: e.layerX,
    top: e.layerY,
  });
  canvas.add(newImage);

  return false;
}

function handleDragEnd(e) {
  // this/e.target is the source node.
  [].forEach.call(images, function (img) {
    img.classList.remove("img_dragging");
  });
}
// ----------------------------------------------------------------------------------------------------------------------------------

// Reset button click event
document.getElementById("close").addEventListener("click", function () {
  location.reload();
});

// Save button click event
document.getElementById("save").addEventListener("click", function () {
  canvas.renderAll();
  const dataURL = canvas.toDataURL({
    format: "png",
  });
  const link = document.createElement("a");
  link.href = dataURL;
  link.download = "canvas-drawing.png";
  document.body.appendChild(link);
  link.click();
  console.log(link);
  document.body.removeChild(link);
});

// Exit button click event
document.getElementById("exit").addEventListener("click", function () {
  // Send a message to the main process to request window close
  window.electronAPI.sendMessageToMain("closeWindow");
});
