/**
 * Drawing Application - Image Upload and Camera Capture
 *
 * Users can upload an image, capture one using their camera, and
 * send the image for further processing. The application also fetches and displays
 * details of recognized persons.
 *
 * Dependencies: Fabric.js, Electron API
 *
 * Functions:
 * - Image Upload: Allows users to upload an image from their local system.
 * - Image Capture: Allows users to capture an image using their webcam.
 * - Image Send: Sends the uploaded or captured image for recognition.
 * - Fetch Person Details: Fetches and displays details of the recognized person.
 * - Display Person Details: Renders the details of the recognized person in the UI.
 */

// Stores the path of the captured image
let capturedImagePath = "";

// Event listener for the image upload input field
document
  .getElementById("imageUpload")
  .addEventListener("change", function (event) {
    // Get DOM references
    const fileInput = event.target;
    const file = fileInput.files[0];
    const preview = document.getElementById("imagePreview");
    const processIndicator = document.getElementById("process-indicator");

    // const video = document.getElementById("video");
    // const captureButton = document.getElementById("captureImage");
    // const previewWindow = document.getElementById("imagePreview");
    // const sendBtn = document.getElementById("sendImage");

    // Rest preview and captured image path
    preview.style.backgroundImage = "none";
    capturedImagePath = "";

    // If a file is selected, read and display the image
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        preview.style.backgroundImage = `url(${e.target.result})`; // Set the preview to the selected iamge
        processIndicator.innerHTML =
          '<img src="file:///assets/images/success.png" alt="Loader" /> Image Uploaded';
        processIndicator.style.color = "gray";
        processIndicator.style.border = "1px solid gray";
      };
      reader.readAsDataURL(file); // Convert iamge to base64
    } else {
      // Reset preview of no image is selcted
      preview.style.backgroundImage = "";
      processIndicator.innerHTML = "Upload image";
      processIndicator.style.color = "gray";
      processIndicator.style.border = "1px solid gray";
    }
  });

// Event listener for the Send Image button click
document.getElementById("sendImage").addEventListener("click", async () => {
  // Get DOM references
  const rightPanel = document.getElementById("right-panel");
  const processIndicator = document.getElementById("process-indicator");
  const fileInput = document.getElementById("imageUpload");
  const loader = document.getElementById("loader");

  // Empty the right result side
  rightPanel.innerHTML = "";

  // Check if an image is selected or captured
  if (fileInput.files.length === 0 && capturedImagePath.length == 0) {
    alert("Please select an image file");
    processIndicator.innerHTML =
      '<img src="file:///assets/images/error.png" alt="Error" /> No image uploaded';
    processIndicator.style.color = "red";
    processIndicator.style.border = "1px solid red";
    return;
  }

  // Determain the file to send based on whether an image was capture or uploaded
  const file = capturedImagePath.length == 0 ? fileInput.files[0] : "";
  const filePath =
    capturedImagePath.length == 0 ? file.path : capturedImagePath;

  // Indicate that the image is being sent to the model
  processIndicator.innerHTML =
    '<img src="file:///assets/images/loading.gif" alt="Loader" /> Sending image to model...';
  processIndicator.style.color = "gray";
  processIndicator.style.border = "1px solid blue";
  loader.style.display = "block";

  try {
    // Try to send the iamge to the recognition model using Election API
    const result = await window.electronAPI.sendImage(filePath);
    const name = result.name;
    const confidence = result.confidence;
    const person_id = name.split(".")[0];

    // If success show progress
    loader.style.display = "none";
    processIndicator.innerHTML =
      '<img src="file:///assets/images/loading.gif" alt="Loader" /> Fetching person details...';
    processIndicator.style.color = "gray";
    processIndicator.style.border = "1px solid blue";

    // Fetch details of the recognised person
    fetchPersonDetails(person_id, confidence);
  } catch (error) {
    console.error("Error in sending file to model:", error);

    // Show error on progress bar
    loader.style.display = "none";
    processIndicator.innerHTML =
      '<img src="file:///assets/images/error.png" alt="Error" /> Error in recognition';
    processIndicator.style.color = "red";
    processIndicator.style.border = "1px solid red";
  }
});

// Event listener for starting the camera
document.getElementById("startCamera").addEventListener("click", () => {
  // Get DOM references
  const video = document.getElementById("video");
  const previewWindow = document.getElementById("imagePreview");
  const captureButton = document.getElementById("captureImage");
  const sendBtn = document.getElementById("sendImage");

  // Access user's webcam
  navigator.mediaDevices
    .getUserMedia({ video: true })
    .then((stream) => {
      video.srcObject = stream;
      video.style.display = "block"; // show the video feed
      captureButton.style.display = "block"; // Show capture button

      // Hide preview image button and send button
      previewWindow.style.display = "none";
      sendBtn.style.display = "none";
    })
    .catch((err) => {
      console.error("Error accessing the camera: ", err);
    });
});

// Event listener for capturing an image from the webcam
document.getElementById("captureImage").addEventListener("click", () => {
  // Get DOM references
  const video = document.getElementById("video");
  const canvas = document.getElementById("canvas");
  const context = canvas.getContext("2d");
  const captureButton = document.getElementById("captureImage");
  const previewWindow = document.getElementById("imagePreview");
  const sendBtn = document.getElementById("sendImage");

  // Draw the video frame on the canvas
  context.drawImage(video, 0, 0, canvas.width, canvas.height);

  // Stop the video stream
  const stream = video.srcObject;
  const tracks = stream.getTracks();
  tracks.forEach((track) => track.stop());

  // Hide the video capture window
  video.style.display = "none";
  // Hide capture button
  captureButton.style.display = "none";
  // Display preview button
  previewWindow.style.display = "block";
  // Display style button
  sendBtn.style.display = "block";

  // Get the image data from the canvas
  const imageDataURL = canvas.toDataURL("image/png");
  capturedImagePath = "";

  // Save the image to the system temporarily and update the preview
  window.electronAPI
    .saveImageTemp(imageDataURL)
    .then((filePath) => {
      capturedImagePath = filePath; // Store the file path in globalImage

      // DOM References
      const preview = document.getElementById("imagePreview");
      const processIndicator = document.getElementById("process-indicator");

      // Set progress on progress bar
      preview.style.backgroundImage = `url(${imageDataURL})`;
      processIndicator.innerHTML =
        '<img src="file:///assets/images/success.png" alt="Loader" /> Image Captured';
      processIndicator.style.color = "gray";
      processIndicator.style.border = "1px solid gray";
    })
    .catch((err) => {
      console.error("Error saving image temporarily: ", err);
    });
});

/**
 * Function: `fetchPersonDetails`
 * Fetches and displays details of the recognized person based on the person ID.
 *
 * @param {string} person_id - The ID of the recognized person.
 * @param {number} confidence - The confidence level of the recognition.
 */
async function fetchPersonDetails(person_id, confidence) {
  // Get DOM References
  const rightPanel = document.getElementById("right-panel");
  const processIndicator = document.getElementById("process-indicator");

  try {
    // Fetch person details using Electron API
    const response = await window.electronAPI.getPerson(person_id);
    if (!response) {
      throw new Error("Failed to fetch person details");
    }

    // Structure person
    const person = { ...response, confidence };

    // Display person details
    displayPersonDetails(person);

    // Show progress on progress bar
    processIndicator.innerHTML =
      '<img src="file:///assets/images/success.png" alt="Success" /> Recognition successful';
    processIndicator.style.color = "green";
    processIndicator.style.border = "1px solid green";
  } catch (error) {
    console.error("Error in fetching person details:", error);

    // Show progress on progress bar
    rightPanel.innerHTML = `<p style="color: red">${error}</p>`;
    processIndicator.innerHTML =
      '<img src="file:///assets/images/error.png" alt="Error" /> Error in fetching details';
    processIndicator.style.color = "red";
    processIndicator.style.border = "1px solid red";
  }
}

/**
 * Function: `displayPersonDetails`
 * Renders the details of the recognized person in the right panel of the UI.
 *
 * @param {Object} person - An object containing person details.
 */
function displayPersonDetails(person) {
  const rightPanel = document.getElementById("right-panel");

  // Clear previous details
  rightPanel.innerHTML = "";

  // Create a heading for results
  const heading = document.createElement("h2");
  heading.textContent = "Results";
  rightPanel.appendChild(heading);

  // Create image element
  const img = new Image();
  img.src = `data:image/jpeg;base64,${person.image}`;
  img.alt = "Person Image";
  img.style.width = "200px"; // Set image width
  img.style.height = "auto"; // Maintain aspect ratio
  rightPanel.appendChild(img);

  // Create a div to hold details
  const detailsDiv = document.createElement("div");

  // Display each detail
  const fields = [
    "name",
    "height",
    "age",
    "sex",
    "color",
    "address",
    "confidence",
  ];
  fields.forEach((field) => {
    if (person[field]) {
      const detail = document.createElement("p");
      detail.textContent = `${
        field.charAt(0).toUpperCase() + field.slice(1)
      }: ${person[field]}`;
      if (field === "confidence") {
        detail.style.color = person[field] > 0.5 ? "red" : "green";
      }
      detailsDiv.appendChild(detail);
    }
  });

  rightPanel.appendChild(detailsDiv);
}
