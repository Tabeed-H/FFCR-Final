"""
Authors: @tabeed @hammad @fatima
server.py is a flask application that provides APIs for recognising facial sketches, adding new person record and retrieving person details from a MongoDB database
Uses GridFS for storing image files and integrates with a custom image recognition script

APIs
-   `/recognise`    (POST)  Process an uploaded image to recognise the person and return the name and confidence socre.
-   `/add_person`   (POST)   Adds a new person to the database with details and an image.
-   `/person/<person_id>`   (POST)  Retrieves person details and image from the database.

NOTE Ensure that MongoDB is running and accessible at 'mongodb://localhost:27017
"""


"""
Dependencies
"""
from flask import Flask, request, jsonify       # To make server request and convert data to JSON format
from script import recognise_image              # Recognition python script
import os                                       # For file operations
from pymongo import MongoClient, errors         # MongoDB ORM
import gridfs                                   # For large file operations for MongoDB
from bson.objectid import ObjectId              # Formating IDs
import base64                                   # For image encodings

# MongoDB connection setup
client = MongoClient('mongodb://localhost:27017/')  # Connection String
db = client['FFCR']                                 # DB name
collection = db['persons']                          # Collection name
fs = gridfs.GridFS(db)                              # Initialize GridFS instance for handling large files in MongoDB


# Initialize Flask Application
app = Flask(__name__)

# Temporary directory for file uploads
TEMP_DIR = os.path.join(os.path.dirname(__file__), 'temp')

# Ensuring the temp directory exists
if not os.path.exists(TEMP_DIR):
    os.makedirs(TEMP_DIR)

@app.route('/recognize', methods=['POST'])
def recognize():
    """
    API endpoint to recognise a person from an uploaded image.
    
    Request:
    -   File    Image file to be recognised
    
    Response:
    -   JSON Object containing:
        -  name: Recognised person's name
        -  confidence: Confidence score of the recognition
        -  error: Error message (if any)
    """
    # If file not present in request
    if 'file' not in request.files:
        return "No file part", 400
    
    # Extract File from request
    file = request.files['file']

    # Error checking is filename not present
    if file.filename == '':
        return "No selected file", 400
    
    # Save the file to the temp directory
    if file:
        file_path = os.path.join(TEMP_DIR, file.filename)
        file.save(file_path)
        
        try:
            # Process the image file
            name, conf, error= recognise_image(file_path)

            # ------------  Debugging line  ------------
            # print(name, conf, error)
            # ------------------------------------------

            if error is not None:
                # If error has occured in the recognition
                response = {
                    "error" : error
                }
                return response
            
            # Succuessfully recognised image
            response = {
                "name": name,
                "confidence": conf
            }
        finally:
            # Delete the file after processing
            os.remove(file_path)
        
        return jsonify(response)
    return "Invalid request", 400

@app.route('/add_person', methods=['POST'])
def add_person():
    """
    API endpoint to add a new person record to the database
    NOTE This endpoint as of now has not been implemented on the front-end
    
    Request:
    -   File        Image file of the person
    -   Form Data   Details of the person (name, height, age, sex, address, person_id)
    
    Response:
    -   JSON object containing
        -   message Status of the operation (Success or error)
    """

    # If person image is not uploaded
    if 'file' not in request.files:
        return "No file part", 400
    
    # Extracting File from request
    file = request.files['file']

    # Additional error checking if filename not present
    if file.filename == '':
        return "No selected file", 400

    # Extract other details from the request
    person_details = request.form.to_dict()

    # Requied field form data should have
    required_fields = ['name', 'height', 'age', 'sex', 'address', 'person_id']

    for field in required_fields:
        if field not in person_details:
            # If any field is missing
            return f"Missing {field}", 400

    if file:
        # Check for duplicate person_id
        if collection.find_one({"person_id": person_details['person_id']}):
            return jsonify({"message": "Duplicate person_id"}), 400

        # Save the file content in GridFS
        file_id = fs.put(file.read(), filename=file.filename)

        try:
            # Store person details in MongoDB
            person_details['image_id'] = file_id
            collection.insert_one(person_details)
        except errors.PyMongoError as e:
            return jsonify({"message": f"Error storing person details: {e}"}), 500

        return jsonify({"message": "Person added successfully"}), 201

    return "Invalid request", 400

@app.route('/person/<person_id>', methods=['GET'])
def get_person(person_id):
    """
    API endpoint to retrieve details and image of a person from the database.
    
    Request:
    -   person_id   ID of the person to be retrived
    
    Response:
    -   JSON object containing
        -   Person Details
        -   Base 64 encoded image (if Available)
        -   message Error message (if Any)"""
    try:
        person = collection.find_one({"person_id": person_id})
        if not person:
            return jsonify({"message": "Person not found"}), 404
        
        # Retrieve the image from GridFS
        image_id = person.get('image_id')

        if image_id:
            grid_out = fs.get(ObjectId(image_id))
            image_data = grid_out.read()
            encoded_image = base64.b64encode(image_data).decode('utf-8')
            person['image'] = encoded_image
        
        # Remove the MongoDB ObjectId as it's not JSON serializable
        person.pop('_id')
        person.pop('image_id')
        return jsonify(person)
    except Exception as e:
        print(f"Error fetching person details: {e}")
        return jsonify({"message": "Server error"}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
