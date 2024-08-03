from flask import Flask, request, jsonify
from script import recognise_image
import os
from pymongo import MongoClient, errors
import gridfs
from bson.objectid import ObjectId
import base64


client = MongoClient('mongodb://localhost:27017/')
db = client['FFCR']
collection = db['persons']
fs = gridfs.GridFS(db)


app = Flask(__name__)

TEMP_DIR = os.path.join(os.path.dirname(__file__), 'temp')

# Ensure the temp directory exists
if not os.path.exists(TEMP_DIR):
    os.makedirs(TEMP_DIR)

@app.route('/recognize', methods=['POST'])
def recognize():
    if 'file' not in request.files:
        return "No file part", 400
    file = request.files['file']
    if file.filename == '':
        return "No selected file", 400
    if file:
        # Save the file to the temp directory
        file_path = os.path.join(TEMP_DIR, file.filename)
        file.save(file_path)
        
        try:
            # Process the image file
            name, conf, error= recognise_image(file_path)
            print(name, conf, error)
            if error is not None:
                response = {
                    "error" : error
                }
                return response
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
    if 'file' not in request.files:
        return "No file part", 400
    file = request.files['file']
    if file.filename == '':
        return "No selected file", 400

    # Extract other details from the request
    person_details = request.form.to_dict()
    required_fields = ['name', 'height', 'age', 'sex', 'address', 'person_id']
    for field in required_fields:
        if field not in person_details:
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
