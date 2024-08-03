// Use window.electronAPI to access Node.js APIs
document.getElementById("draw-sketch-btn").addEventListener("click", () => {
  // Send message to the main process to open the draw sketch window
  window.electronAPI.sendMessageToMain("open-draw-sketch-window");
});

document.getElementById("run-recognition-btn").addEventListener("click", () => {
  // Send message to the main process to open the run recognition window
  window.electronAPI.sendMessageToMain("open-run-recognition-window");
});
