import os
from collections import defaultdict

# Define the path to the directory containing the images
image_directory = '../DataSet/Train'

# Initialize counters and data structures
total_images = 0
persons = set()
images_per_person = defaultdict(int)

# Iterate over files in the directory
for filename in os.listdir(image_directory):
    if filename.endswith('.jpg'):
        total_images += 1
        parts = filename.split('.')
        if len(parts) == 3 and parts[0].startswith('person'):
            person_id = parts[0]
            persons.add(person_id)
            images_per_person[person_id] += 1

# Calculate the number of persons
no_of_persons = len(persons)

# Prepare summary
summary = f"Total images: {total_images}\n"
summary += f"Number of persons: {no_of_persons}\n"
summary += "Number of images per person:\n"
for person_id, count in images_per_person.items():
    summary += f"  {person_id}: {count}\n"

# Output the summary to a text file
output_file = 'image_summary.txt'
with open(output_file, 'w') as f:
    f.write(summary)

print(f"Summary written to {output_file}")
