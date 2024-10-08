# FFCR-Final Repository

This repository contains the complete source code and assets for the Final Year Project titled **Facial Sketch Construction and Recognition (FFCR)**. The project is focused on constructing and recognizing facial sketches using deep learning techniques, combining both backend processing and a frontend interface.

## Repository Structure

The repository is organized into the following main directories and files:

- **[Backend](#backend)**
- **[Desktop](#desktop)**
- **[Other Python Scripts](#other-python-scripts)**
- **[FFCR.persons.json](#ffcrpersonsjson)**
- **[test_DataSet_Summary.txt](#test_datasetsummarytxt)**
- **[Trainin_DataSet_Summary.txt](#trainin_datasetsummarytxt)**
- **.gitignore**

---

### Backend

The `Backend` folder contains all the necessary files for the server-side of the application. It includes scripts for handling image processing, facial recognition, and interaction with the database (MongoDB).

Key components:

- **Flask Server**: Handles HTTP requests, image uploads, and responses.
- **Image Processing Scripts**: Implement image recognition and sketch construction using Python libraries.
- **Database Management**: Interacts with MongoDB to store and retrieve recognized person details.

### Desktop

The `Desktop` folder houses the frontend part of the application, which serves as the user interface for interacting with the FFCR system. This includes the following:

- **User Interface**: Allows users to upload images, capture images via webcam, and display recognition results.
- **Integration with Backend**: Sends images to the backend for processing and displays the results received from the server.
- **Assets**: Contains images, icons, and other static resources used in the UI.

### Other Python Scripts

This directory includes various utility scripts used for preprocessing the dataset and summarizing data:

1. **processDataSet.py**:

   - Converts images to sketches.
   - Applies preprocessing like contrast adjustment.
   - Saves both the original and processed images.

2. **resize.py**:

   - Resizes images to a standard dimension required for the training models.
   - Ensures consistency in input data for better accuracy in recognition.

3. **summarizeDataSet.py**:
   - Generates a summary report of the dataset.
   - Counts the number of images and categorizes them by type (original, sketch, etc.).

### FFCR.persons.json

This JSON file contains structured data intended for MongoDB. It includes details about the persons in the dataset, which are used during the recognition process to identify and match images. This file serves as a schema for the database.

### test_DataSet_Summary.txt

A text file that provides a summary of the test dataset. It includes information such as:

- **Number of Images**: Total count of images available

### Trainin_DataSet_Summary.txt

Similar to the `test_DataSet_Summary.txt`, this file summarizes the training dataset used for model training. It contains:

- **Total Image Count**: Number of images used for training.

### .gitignore

The `.gitignore` file specifies the files and directories that should be ignored by version control to maintain a clean repository. This typically includes:

---
