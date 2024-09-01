/**
 * main.js  Electron Main Process Script
 *
 * Authors: @Tabeed-H @hammad @fatimah
 *
 * This script handles the main process of the Election app including:
 *  - Creating and Managing main application windows (main, draw sketck, and recognise sketch)
 *  - Handling inter-process communication (IPC) between main process and renderer processes.
 *  - Performing file operation such as reading directories and saving temprorary file.
 *  - Sending HTTP request to the backedn server for image recognition.
 *
 */

// Test Statement
console.log("Starting");

const { app, BrowserWindow, ipcMain } = require("electron"); //  app - controlls application lifecycle events; BrowserWindow - create and mange application windows; ipcMain - handling IPC
const path = require("path"); //   Work with file and directory paths
const fs = require("fs"); //  Reading and writing to the file system
const axios = require("axios"); //  Making HTTP calls
const os = require("os"); //  Provides OS level utiltiy methods
const FormData = require("form-data"); // To create a from to be send as multipart/form-data

// Varialbe decleration to hold references to the Main and Draw Sketch Window
let mainWindow, drawSketchWindow;

/**
 * Function: `createMainWindow`
 * Create the Main application window.
 * This loads the  main HTML file for the applicaton
 * Attached a preloader file for IPC
 */
function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, "./preload.js"),
    },
  });

  // Load the Main HTML file
  mainWindow.loadFile("../renderer/index.html");
}

// Call the `createMainWindow` function to create the main window when electron is ready
app.on("ready", createMainWindow);

/**
 * Event Handler
 * Event: `open-draw-sketch-window`
 *
 * Opens the sketch drawing window.
 * Event is triggered by an IPC message from the renderer process.
 * Attaches the preloader for IPC
 */
ipcMain.on("open-draw-sketch-window", () => {
  drawSketchWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, "./preload.js"),
    },
  });

  // Load the Drawing HTML File
  drawSketchWindow.loadFile("../renderer/components/Drawing/draw.html");
});

/**
 * Event Handler
 * Event: `open-run-recognition-window`
 *
 * Opens the run recognition window
 * Event is triggered by an IPC message from the renderer process.
 * Attaches the preloader for IPC
 */
ipcMain.on("open-run-recognition-window", () => {
  const runRecognitionWindow = new BrowserWindow({
    width: 1920,
    height: 1080,

    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, "./preload.js"),
    },
  });

  // Load the recognitoin HTML file
  runRecognitionWindow.loadFile(
    "../renderer/components/Recognition/recognition.html"
  );
});

/**
 * Event Handler
 * Event: `closeWindow`
 *
 * Closes the Draw Sketch window.
 * Triggered by an IPC message from the rendrer process.
 */
ipcMain.on("closeWindow", () => {
  drawSketchWindow.close();
});

/**
 * Functoin: `get-file-list`
 * Retrives a list of image files from a specified directory to be used to get the facial components files and their names
 *
 * @param {string} - The Path to the directory containing images.
 * @returns {Array} - A list of image file names.
 */
ipcMain.handle("get-file-list", async (event, directoryPath) => {
  try {
    const files = await fs.promises.readdir(directoryPath);

    // Filter only image files
    const imageFiles = files.filter((file) => /\.(jpg|jpeg|png)$/i.test(file));

    // Return the list of image files
    return imageFiles;
  } catch (error) {
    console.error("Error reading directory:", error);
    throw error;
  }
});

/**
 * Function: `save-image-temporarily`
 * Saves an image temporarily to the system's temp directory.
 *
 * @param {string} imageDataURL - The base 64 encoded image data URL.
 * @returns {string} - The file path where the image is saved.
 */
ipcMain.handle("save-image-temporarily", async (event, imageDataURL) => {
  const base64Data = imageDataURL.replace(/^data:image\/png;base64,/, "");
  const tempDir = os.tmpdir(); // Get the system temp directory
  const filePath = path.join(tempDir, `captured-image-${Date.now()}.png`); // Generate unique file name

  try {
    fs.writeFileSync(filePath, base64Data, "base64"); // Save the image
    return filePath; // Return the file path to the renderer process
  } catch (err) {
    console.error("Failed to save the image:", err);
    throw err;
  }
});

/**
 * Function: `send-image`
 * Sends an image to the backend for recognition.
 *
 * @param {string} filePath - The path of the image file to be sent.
 * @returns {Object} - An object containing the name and confidence of the recognised person 0r an error message
 */
ipcMain.handle("send-image", async (event, filePath) => {
  try {
    const formData = new FormData();
    formData.append("file", fs.createReadStream(filePath)); // Append image file to form data

    // Make API requrest with form data
    const response = await axios.post(
      "http://localhost:5000/recognize",
      formData,
      {
        headers: formData.getHeaders(),
      }
    );

    // Structure response data
    data = {
      name: response.data.name,
      confidence: response.data.confidence,
    };

    // return data
    return data;
  } catch (error) {
    console.error(error);
    return { error: "Failed to process image" };
  }
});

/**
 * Function: `get-person`
 * Retrieves details of a person from the backend.
 *
 * @param {string} person_id - The ID of the person to fetch details for.
 * @returns {Object} - An object containing person details or an error message.
 */
ipcMain.handle("get-person", async (event, person_id) => {
  try {
    // Make HTTP request
    const response = await axios.get(
      `http://localhost:5000/person/${person_id}`
    );

    // Throw error ir any
    if (!response) {
      throw new Error("Failed to fetch person details");
    }

    // return person details
    return response.data;
  } catch (error) {
    console.error("Error in fetching person details:", error);
  }
});
