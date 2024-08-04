console.log("Starting");

const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");
const axios = require("axios");
const FormData = require("form-data");

let mainWindow, drawSketchWindow;

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
  // mainWindow.webContents.openDevTools();

  mainWindow.loadFile("../renderer/index.html");
}

app.on("ready", createMainWindow);

ipcMain.on("open-draw-sketch-window", () => {
  drawSketchWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, "./preload.js"),
    },
  });
  // drawSketchWindow.webContents.openDevTools();

  drawSketchWindow.loadFile("../renderer/components/Drawing/draw.html");
});

ipcMain.on("open-run-recognition-window", () => {
  const runRecognitionWindow = new BrowserWindow({
    width: 1920,
    height: 1080,

    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, "./preload.js"),
    },
  });

  runRecognitionWindow.loadFile(
    "../renderer/components/Recognition/recognition.html"
  );
});
ipcMain.handle("get-file-list", async (event, directoryPath) => {
  try {
    const files = await fs.promises.readdir(directoryPath);
    // Filter only image files (e.g., jpg, png)
    const imageFiles = files.filter((file) => /\.(jpg|jpeg|png)$/i.test(file));
    // Return the list of image files
    return imageFiles;
  } catch (error) {
    console.error("Error reading directory:", error);
    throw error;
  }
});
ipcMain.on("closeWindow", () => {
  drawSketchWindow.close();
});

ipcMain.handle("send-image", async (event, filePath) => {
  try {
    const formData = new FormData();
    formData.append("file", fs.createReadStream(filePath));

    const response = await axios.post(
      "http://localhost:5000/recognize",
      formData,
      {
        headers: formData.getHeaders(),
      }
    );
    data = {
      name: response.data.name,
      confidence: response.data.confidence,
    };
    return data;
  } catch (error) {
    console.error(error);
    return { error: "Failed to process image" };
  }
});

ipcMain.handle("get-person", async (event, person_id) => {
  try {
    const response = await axios.get(
      `http://localhost:5000/person/${person_id}`
    );
    if (!response) {
      throw new Error("Failed to fetch person details");
    }
    return response.data;
  } catch (error) {
    console.error("Error in fetching person details:", error);
  }
});
