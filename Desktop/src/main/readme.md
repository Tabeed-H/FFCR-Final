# Electron Application

## Overview

This project is an Electron-based application that utilizes a desktop environment to facilitate tasks related to face recognition and sketching. It consists of two main scripts: `main.js`, which is the main entry point of the Electron application, and `preload.js`, which securely exposes specific APIs to the renderer process.

## File Summaries

#### Total Number of Line of Code (Approx.) = 315 _(including documentation comments)_

### 1. `main.js`

This file is the main entry point of the Electron application. It initializes and manages the main window and other secondary windows. It also handles the IPC (Inter-Process Communication) between the main process and the renderer processes.

### 2. `preload.js`

This script acts as a bridge between the main process and the renderer process. It securely exposes Node.js APIs to the renderer process using Electron's `contextBridge`.
