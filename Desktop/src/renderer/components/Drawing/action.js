/**
 * This Script provides functionality for an interactive application allowing:
 *  - Selecting a resource pack from a dropdown menu.
 *  - Load corresponding images from the selected resource pack.
 *  - Using Fabric.js canvas for image manipulation.
 *  - Saving Sketch.
 *  - Intereaction Buttons.
 */

/**
 * We have two resource packs (Facial Componenets) default and region specifc (JK)
 */
// Default selected resource pack
// Other value 'RE-JK'
let selectedValue = "Default";

// Initialize evnet listener once the DOM content is fully loaded
// Loades the resource pack
document.addEventListener("DOMContentLoaded", function () {
  // Get references to dropdown elements
  var dropdownButton = document.getElementById("dropvalue");
  var dropdownContent = document.getElementById("dropdown-content");

  // Event listner for selecting a value from the dropdown
  dropdownContent.addEventListener("click", function (event) {
    // Prevent default action of the even
    event.preventDefault();

    // Get selected value from the front-end
    selectedValue = event.target.dataset.value;

    // Update the dropdown button text
    dropdownButton.textContent = `${selectedValue}`;

    const rightContainer = document.querySelector(".right");
    rightContainer.innerHTML = ""; // Clear the right container content

    // ------------------------ Debugging Statement -----------------------
    // console.log("Selected value:", selectedValue);
  });
});

// Add click event listners to all elements with the class 'component'
// component here are the different facial compoenets (like: head, nose etc)
// Then gets the different variations for each facial componenets available
document.querySelectorAll(".component").forEach((component) => {
  component.addEventListener("click", () => {
    // Get the Id of the clicked compoenet
    const componentId = component.id;

    // ----------------------- Debugging Statement --------------------
    // console.log(componentId);

    // const rightContainer = document.querySelector(".right");       -- not used remove later

    // Load and display images for the compoenet
    displayImagesForComponent(componentId, selectedValue);
  });
});

// Function to load and display images for the selected component
async function displayImagesForComponent(componentId, resourcePack) {
  // Select the right display section
  const rightContainer = document.querySelector(".right");
  rightContainer.innerHTML = ""; // Clear section

  // Construct the folder path for the compoenet
  const componentFolderPath = `assets/${resourcePack}/${componentId}`;

  try {
    // Electron API to get a list of files in the component folder
    const fileList = await window.electronAPI.getFileList(componentFolderPath);

    // Display the retrived images
    displayImages(fileList, componentId, resourcePack);
  } catch (error) {
    console.error("Error getting file list:", error);
  }
}

// Function to display images (Facial compoenets variations) from the file list
function displayImages(fileList, componentId, resourcePack) {
  // Select and clear right container content
  const rightContainer = document.querySelector(".right");
  rightContainer.innerHTML = "";

  // Loop throught the file list and create img elements for each file
  // Added Each variation for a facail component
  fileList.forEach((fileName) => {
    const imgElement = document.createElement("img"); // Create img tag
    imgElement.src = `file:///assets/${resourcePack}/${componentId}/${fileName}`; // Set image source
    imgElement.draggable = true; // Make the image draggable
    imgElement.className = "dragImg"; // Add class for drag behavior
    imgElement.id = `${componentId}-${fileName}`; // Set image ID
    rightContainer.appendChild(imgElement); // Add image to the right container
  });

  // For Fabric.js code (DONOT CHANGE)
  // Add drag event listners to each iamage
  var images = document.querySelectorAll(".dragImg");
  [].forEach.call(images, function (img) {
    img.addEventListener("dragstart", handleDragStart, false);
    img.addEventListener("dragend", handleDragEnd, false);
  });

  // Get the reference to the drawing canvas container and set up drag event listner
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

// Create a new Fabric.js canvas instance
var canvas = new fabric.Canvas("canvas");

/* 
NOTE: the start and end handlers are events for the <img> elements; the rest are bound to 
the canvas container.
*/

// Handle drag start event for images
function handleDragStart(e) {
  [].forEach.call(images, function (img) {
    img.classList.remove("img_dragging"); // removing dragging class from all images
  });
  this.classList.add("img_dragging"); // Add dragging class to the currently dragged image
}

// Handle drag over event to allow drop
function handleDragOver(e) {
  if (e.preventDefault) {
    e.preventDefault(); // Necessary. Allows us to drop.
  }

  e.dataTransfer.dropEffect = "copy"; // Indicate that the drop will result in a copy action

  return false;
}

// Handle drag enter evnet to style the drop target
function handleDragEnter(e) {
  // this / e.target is the current hover target.
  this.classList.add("over");
}

// Handle drag leave event to remove drop target style
function handleDragLeave(e) {
  this.classList.remove("over"); // this / e.target is previous target element.
}

// Handle drop event to add image to the Fabric.js canvas
function handleDrop(e) {
  // this / e.target is current target element.

  if (e.stopPropagation) {
    e.stopPropagation(); // stops the browser from redirecting.
  }

  // Get the dragged image
  var img = document.querySelector("#images img.img_dragging");

  // ---------------  Debuggin line -----------------------------
  // console.log("event: ", e);

  var newImage = new fabric.Image(img, {
    left: e.layerX, // Set the image's left position based on the drop coordinates
    top: e.layerY, // Set the image's top position based on the drop coordinates
  });
  canvas.add(newImage); // Add image to the convas

  return false;
}

// Handle drag end event to clean up
function handleDragEnd(e) {
  // this/e.target is the source node.
  [].forEach.call(images, function (img) {
    img.classList.remove("img_dragging"); // remove dragging class from all images
  });
}
// ----------------------------------------------------------------------------------------------------------------------------------

// Reset button click event
document.getElementById("close").addEventListener("click", function () {
  location.reload();
});

// Save button click event
document.getElementById("save").addEventListener("click", function () {
  canvas.renderAll(); // Render the canvas to apply all changes

  // Save in PNG format
  const dataURL = canvas.toDataURL({
    format: "png",
  });

  const link = document.createElement("a"); // Create a link element
  link.href = dataURL; // Set the image data URL as the href
  link.download = "canvas-drawing.png"; // Set the download file name
  document.body.appendChild(link); // Append link to the document
  link.click(); // Simuate click to drigger download
  document.body.removeChild(link); // Remove the link from the document
});

// Exit button click event
document.getElementById("exit").addEventListener("click", function () {
  // Send a message to the main process to request window close
  window.electronAPI.sendMessageToMain("closeWindow");
});
