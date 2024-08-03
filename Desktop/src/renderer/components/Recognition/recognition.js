// // const { ipcRenderer } = require("electron");
// console.log("Started Recogniton");
// document.getElementById("sendImage").addEventListener("click", async () => {
//   let name, confidence;
//   const fileInput = document.getElementById("imageUpload");
//   if (fileInput.files.length === 0) {
//     alert("Please select an image file");
//     return;
//   }

//   const file = fileInput.files[0];
//   const filePath = file.path;

//   try {
//     const result = await window.electronAPI.sendImage(filePath);
//     name = result.name;
//     confidence = result.confidence;
//   } catch (error) {
//     console.log(error);
//   }
//   document.getElementById("result").innerText = JSON.stringify(
//     name,
//     confidence
//   );
// });
document
  .getElementById("imageUpload")
  .addEventListener("change", function (event) {
    const fileInput = event.target;
    const file = fileInput.files[0];
    const preview = document.getElementById("imagePreview");

    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        preview.style.backgroundImage = `url(${e.target.result})`;
      };
      reader.readAsDataURL(file);
    } else {
      preview.style.backgroundImage = "";
    }
  });

document.getElementById("sendImage").addEventListener("click", async () => {
  const fileInput = document.getElementById("imageUpload");
  const loader = document.getElementById("loader");
  const resultDiv = document.getElementById("result");

  if (fileInput.files.length === 0) {
    alert("Please select an image file");
    return;
  }

  const file = fileInput.files[0];
  const filePath = file.path;

  loader.style.display = "block";

  try {
    // resultDiv.innerHTML = `<p>Error in recognition</p>`;
    loader.innerHTML = "Loading..";
    const result = await window.electronAPI.sendImage(filePath);
    const name = result.name;
    const confidence = result.confidence;
    const person_id = name.split(".")[0];

    loader.style.display = "none";

    fetchPersonDetails(person_id, confidence);
  } catch (error) {
    console.error("Error in sending file to model:", error);
    loader.style.display = "none";
    resultDiv.innerHTML = `<p>Error in recognition</p>`;
  }
});

async function fetchPersonDetails(person_id, confidence) {
  try {
    const response = await window.electronAPI.getPerson(person_id);
    if (!response) {
      // window.alert("Cannot Detect Person with Accuracy");
      throw new Error("Failed to fetch person details");
    }

    const person = { ...response, confidence };
    displayPersonDetails(person);
  } catch (error) {
    console.error("Error in fetching person details:", error);
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

  // Append image and details to the right panel
  rightPanel.appendChild(img);
  rightPanel.appendChild(detailsDiv);
}

document.getElementById("instructions-button").addEventListener("click", () => {
  const instructionsPanel = document.getElementById("instructions-panel");
  if (instructionsPanel.style.right === "10px") {
    instructionsPanel.style.right = "-300px";
  } else {
    instructionsPanel.style.right = "10px";
  }
});
