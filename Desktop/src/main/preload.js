// Expose Node.js APIs to the renderer process
const { contextBridge, ipcRenderer } = require("electron");

// Define the API methods to expose
const api = {
  // Example method to send a message to the main process
  sendMessageToMain: (channel, data) => {
    ipcRenderer.send(channel, data);
  },
  getFileList: async (directoryPath) => {
    try {
      const fileList = await ipcRenderer.invoke("get-file-list", directoryPath);
      return fileList;
    } catch (error) {
      console.error("Error getting file list:", error);
      return [];
    }
  },
};

// Expose the API methods to the renderer process
contextBridge.exposeInMainWorld("electronAPI", api);
