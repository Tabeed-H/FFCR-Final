console.log("Starting");

const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");

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
    width: 1440,
    height: 860,
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
    width: 600,
    height: 400,

    webPreferences: {
      nodeIntegration: true,
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
