# Image Recognition Web Application

This is a simple image recognition web application that allows users to capture or upload an image and get recognition results displayed with confidence scores. The application is built using HTML, CSS, and JavaScript.

## Project Structure

The project consists of the following files:

- `recognition.html`: The main HTML file that structures the layout and content of the web application.
- `recognition.css`: The CSS file that contains styles for the application's layout and components.
- `recognition.js`: The JavaScript file that handles the functionality of capturing images, uploading files, and processing recognition.

## Features

- **Capture Image**: Use the webcam to capture an image.
- **Upload Image**: Upload an image from your local file system.
- **Display Image Preview**: Show a preview of the uploaded or captured image.
- **Send Image for Recognition**: Process the image to get recognition results.
- **Confidence Score**: Display confidence scores indicating the accuracy of recognition.

## How to Use

1. **Start Camera**: Click the "Capture Image" button to start the webcam. A live video feed will appear.

2. **Capture or Upload Image**:

   - To capture an image, use the webcam and click the capture button.
   - To upload an image, click the "Choose File" button and select an image from your local files.

3. **Send Image for Recognition**: Click the "Send Image" button to process the captured or uploaded image. The application will display recognition results in the right panel with confidence scores.

4. **View Results**: The recognized person details will be displayed in the right panel with confidence scores indicating the reliability of the recognition.

## Instructions and Confidence Score

- The application displays a confidence score for each recognition result:
  - **Confidence < 0.5**: High confidence (correct identification)
  - **Confidence > 0.5**: Low confidence (possible mismatch)
- Follow the on-screen instructions for a smooth user experience.

## File Descriptions

- **recognition.html**: Contains the structure of the web application, including the left and right panels, buttons, video elements, and instructions panel.
- **recognition.css**: Provides styling for various components of the application, including buttons, panels, and layout adjustments.
- **recognition.js**: Handles the application's logic, such as starting the webcam, capturing images, uploading files, and displaying results.
