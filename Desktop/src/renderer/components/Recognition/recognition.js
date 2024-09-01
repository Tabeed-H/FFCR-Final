let capturedImagePath = "";
document
  .getElementById("imageUpload")
  .addEventListener("change", function (event) {
    const fileInput = event.target;
    const file = fileInput.files[0];
    const preview = document.getElementById("imagePreview");
    const processIndicator = document.getElementById("process-indicator");
    const video = document.getElementById("video");
    const captureButton = document.getElementById("captureImage");
    const previewWindow = document.getElementById("imagePreview");
    const sendBtn = document.getElementById("sendImage");

    preview.style.backgroundImage = "none";
    capturedImagePath = "";

    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        preview.style.backgroundImage = `url(${e.target.result})`;
        processIndicator.innerHTML =
          '<img src="file:///assets/images/success.png" alt="Loader" /> Image Uploaded';
        processIndicator.style.color = "gray";
        processIndicator.style.border = "1px solid gray";
      };
      reader.readAsDataURL(file);
    } else {
      preview.style.backgroundImage = "";
      processIndicator.innerHTML = "Upload image";
      processIndicator.style.color = "gray";
      processIndicator.style.border = "1px solid gray";
    }
  });

document.getElementById("sendImage").addEventListener("click", async () => {
  const rightPanel = document.getElementById("right-panel");
  const processIndicator = document.getElementById("process-indicator");
  rightPanel.innerHTML = "";

  const fileInput = document.getElementById("imageUpload");
  const loader = document.getElementById("loader");

  if (fileInput.files.length === 0 && capturedImagePath.length == 0) {
    alert("Please select an image file");
    processIndicator.innerHTML =
      '<img src="file:///assets/images/error.png" alt="Error" /> No image uploaded';
    processIndicator.style.color = "red";
    processIndicator.style.border = "1px solid red";
    return;
  }

  // const file = fileInput.files[0];
  const file = capturedImagePath.length == 0 ? fileInput.files[0] : "";
  // const filePath = file.path;
  const filePath =
    capturedImagePath.length == 0 ? file.path : capturedImagePath;

  processIndicator.innerHTML =
    '<img src="file:///assets/images/loading.gif" alt="Loader" /> Sending image to model...';
  processIndicator.style.color = "gray";
  processIndicator.style.border = "1px solid blue";
  loader.style.display = "block";

  try {
    const result = await window.electronAPI.sendImage(filePath);
    console.log(result);
    const name = result.name;
    const confidence = result.confidence;
    const person_id = name.split(".")[0];

    loader.style.display = "none";
    processIndicator.innerHTML =
      '<img src="file:///assets/images/loading.gif" alt="Loader" /> Fetching person details...';
    processIndicator.style.color = "gray";
    processIndicator.style.border = "1px solid blue";

    fetchPersonDetails(person_id, confidence);
  } catch (error) {
    console.error("Error in sending file to model:", error);
    loader.style.display = "none";
    processIndicator.innerHTML =
      '<img src="file:///assets/images/error.png" alt="Error" /> Error in recognition';
    processIndicator.style.color = "red";
    processIndicator.style.border = "1px solid red";
  }
});

document.getElementById("startCamera").addEventListener("click", () => {
  const video = document.getElementById("video");
  const previewWindow = document.getElementById("imagePreview");
  const captureButton = document.getElementById("captureImage");
  const sendBtn = document.getElementById("sendImage");

  navigator.mediaDevices
    .getUserMedia({ video: true })
    .then((stream) => {
      video.srcObject = stream;
      video.style.display = "block";
      captureButton.style.display = "block";
      previewWindow.style.display = "none";
      sendBtn.style.display = "none";
    })
    .catch((err) => {
      console.error("Error accessing the camera: ", err);
    });
});

document.getElementById("captureImage").addEventListener("click", () => {
  const video = document.getElementById("video");
  const canvas = document.getElementById("canvas");
  const context = canvas.getContext("2d");
  const captureButton = document.getElementById("captureImage");
  const previewWindow = document.getElementById("imagePreview");
  const sendBtn = document.getElementById("sendImage");

  context.drawImage(video, 0, 0, canvas.width, canvas.height);

  // Stop the video stream
  const stream = video.srcObject;
  const tracks = stream.getTracks();
  tracks.forEach((track) => track.stop());
  video.style.display = "none";
  captureButton.style.display = "none";
  previewWindow.style.display = "block";
  sendBtn.style.display = "block";

  // Get the image data from the canvas
  const imageDataURL = canvas.toDataURL("image/png");
  capturedImagePath = "";

  // Save the image to the system temporarily
  window.electronAPI
    .saveImageTemp(imageDataURL)
    .then((filePath) => {
      capturedImagePath = filePath; // Store the file path in globalImage

      const preview = document.getElementById("imagePreview");
      const processIndicator = document.getElementById("process-indicator");

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

// Assuming fetchPersonDetails and displayPersonDetails functions remain unchanged
async function fetchPersonDetails(person_id, confidence) {
  const rightPanel = document.getElementById("right-panel");
  const processIndicator = document.getElementById("process-indicator");

  try {
    const response = await window.electronAPI.getPerson(person_id);
    if (!response) {
      throw new Error("Failed to fetch person details");
    }

    const person = { ...response, confidence };
    displayPersonDetails(person);

    processIndicator.innerHTML =
      '<img src="file:///assets/images/success.png" alt="Success" /> Recognition successful';
    processIndicator.style.color = "green";
    processIndicator.style.border = "1px solid green";
  } catch (error) {
    console.error("Error in fetching person details:", error);
    rightPanel.innerHTML = `<p style="color: red">${error}</p>`;
    processIndicator.innerHTML =
      '<img src="file:///assets/images/error.png" alt="Error" /> Error in fetching details';
    processIndicator.style.color = "red";
    processIndicator.style.border = "1px solid red";
  }
}

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
