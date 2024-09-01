// Expose Node.js APIs to the renderer process
const { contextBridge, ipcRenderer } = require("electron");

// Define the API methods to expose
const api = {
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
  sendImage: async (path) => {
    try {
      const result = await ipcRenderer.invoke("send-image", path);
      return result;
    } catch (error) {
      console.error("Error in sending file to model: ", error);
      return -1;
    }
  },
  getPerson: async (person_id) => {
    try {
      const result = await ipcRenderer.invoke("get-person", person_id);
      return result;
    } catch (error) {
      console.error("Error Fetching Person Detsils");
      return "Error Fetching Person Details";
    }
  },
  saveImageTemp: async (imageDataURL) => {
    try {
      const result = await ipcRenderer.invoke(
        "save-image-temporarily",
        imageDataURL
      );
      return result;
    } catch (error) {
      console.error("Error Saving Captured Image");
      return "Error Saving Captured Images";
    }
  },
};

// Expose the API methods to the renderer process
contextBridge.exposeInMainWorld("electronAPI", api);
