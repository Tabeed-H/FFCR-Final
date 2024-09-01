/**
 * preload.js
 * Electron preload Script
 *
 * Authors: @Tabeed-H @hammad @fatimah
 *
 * The preload script is used to securely expose Node.js APIs to the renderer process.
 * It makes the use of Electron's context bridge and IPC modules for communication between the main process and the renderer process.
 * The script defines a set of APIs that the renderer process can use to interact with the main process.
 */

// -  contextBridge: provides a safe way to expose APIs from the main process to the renderer process.
// -  ipcRenderer: allows asynchronous communication from the renderer to the main processs
const { contextBridge, ipcRenderer } = require("electron");

// Define the API methods to expose
const api = {
  /**
   * API: `sendMessageToMain`
   * Send a message to the main process via a specific channel.
   *
   * @param {string} channel - The Name of the IPC channel to send the message to .
   * @param {*} data - The data to send along with the massage.
   */
  sendMessageToMain: (channel, data) => {
    ipcRenderer.send(channel, data);
  },

  /**
   * API: `getFileList`
   * Get a list of files from a specified directory
   *
   * @param {string} directoryPath - The path of the directory to list files from.
   * @returns {Array} - Array of file name.
   */
  getFileList: async (directoryPath) => {
    try {
      // invoke the 'get-file-list' channel and pass the directory path
      const fileList = await ipcRenderer.invoke("get-file-list", directoryPath);
      return fileList; // return the list of files
    } catch (error) {
      console.error("Error getting file list:", error);
      return []; // return an empty array in case of an error
    }
  },

  /**
   * API: `sendImage`
   * Send an image file to the main process for processing.
   *
   * @param {string} path - The file path of the image to send
   * @returns {Object}  - The result object of the recognition
   */
  sendImage: async (path) => {
    try {
      // Invoke the 'send-image' channel and pass the image file path
      const result = await ipcRenderer.invoke("send-image", path);
      return result;
    } catch (error) {
      console.error("Error in sending file to model: ", error);
      return -1;
    }
  },

  /**
   *  API: `getPerson`
   * Fetch details of a person by their ID
   *
   * @param {string} person_id - The ID of the person to fetch details for.
   * @returns {Object} - Details of the person
   */
  getPerson: async (person_id) => {
    try {
      // Invoke the 'get-person' channel and pass the person ID
      const result = await ipcRenderer.invoke("get-person", person_id);
      return result;
    } catch (error) {
      console.error("Error Fetching Person Detsils");
      return "Error Fetching Person Details";
    }
  },

  /**
   * API: `saveImageTemp`
   * Save an image temporarily on the local file system.
   *
   * @param {string} imageDataURL - The data URL of the image to save.
   * @returns {string}  - Path of the saved image
   */
  saveImageTemp: async (imageDataURL) => {
    try {
      // Invoke the 'save-image-temporarily' channel and pass the image data URL
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
// The renderer process can access these methods via window.electronAPI
contextBridge.exposeInMainWorld("electronAPI", api);
