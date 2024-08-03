from PIL import Image, ImageOps
import os

def resize_and_pad_image(input_path, output_path, size=(300, 300)):
    # Open an image file
    with Image.open(input_path) as img:
        # Resize image while maintaining aspect ratio
        img.thumbnail(size, Image.LANCZOS)
        img.save(output_path)

def resize_images_in_folder(input_folder, output_folder):
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)
    
    for filename in os.listdir(input_folder):
        if filename.lower().endswith(('png', 'jpg', 'jpeg', 'tiff', 'bmp', 'gif')):
            input_path = os.path.join(input_folder, filename)
            output_path = os.path.join(output_folder, filename)
            resize_and_pad_image(input_path, output_path)
            print(f'Resized and padded: {filename}')

# Example usage
input_folder = '../playground'
output_folder = '../playground/Test'
resize_images_in_folder(input_folder, output_folder)
