import os
import cv2
import numpy as np
from PIL import Image, ImageEnhance

def create_sketch(image):
    """Convert an image to a sketch using OpenCV."""
    grey_img = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    invert = cv2.bitwise_not(grey_img)
    blur = cv2.GaussianBlur(invert, (21, 21), 0)
    invertedblur = cv2.bitwise_not(blur)
    sketch = cv2.divide(grey_img, invertedblur, scale=256.0)
    return sketch

def increase_contrast(image, factor):
    """Increase the contrast of an image by a given factor using PIL."""
    enhancer = ImageEnhance.Contrast(image)
    return enhancer.enhance(factor)

def normalize_image(image):
    """Normalize an image using OpenCV."""
    norm_image = np.zeros(image.shape)
    norm_image = cv2.normalize(image, norm_image, 0, 255, cv2.NORM_MINMAX)
    return norm_image

def process_images(input_folder, output_folder, contrast_factor=8):
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)
    
    for root, _, files in os.walk(input_folder):
        for file in files:
            if file.lower().endswith(('.png', '.jpg', '.jpeg')):
                file_path = os.path.join(root, file)
                
                # Read the image using OpenCV
                cv_image = cv2.imread(file_path)
                
                # Create a sketch
                sketch_img = create_sketch(cv_image)
                
                # Convert OpenCV sketch image (numpy array) to PIL image
                pil_sketch_img = Image.fromarray(sketch_img)
                
                # Increase contrast of the sketch
                contrasted_sketch = increase_contrast(pil_sketch_img, contrast_factor)
                
                # Normalize the original image
                normalized_img = normalize_image(cv_image)
                
                # Convert OpenCV images (numpy arrays) to PIL images
                pil_img = Image.fromarray(cv2.cvtColor(cv_image, cv2.COLOR_BGR2RGB))
                pil_normalized_img = Image.fromarray(cv2.cvtColor(normalized_img, cv2.COLOR_BGR2RGB))
                
                # Prepare filenames
                filename, ext = os.path.splitext(file)
                sketch_filename = f"{filename}.sketch{ext}"
                contrasted_sketch_filename = f"{filename}.sketch.contrast{ext}"
                normalized_filename = f"{filename}.normalized{ext}"
                
                # Save images
                pil_normalized_img.save(os.path.join(output_folder, normalized_filename))
                pil_img.save(os.path.join(output_folder, file))
                pil_sketch_img.save(os.path.join(output_folder, sketch_filename))
                contrasted_sketch.save(os.path.join(output_folder, contrasted_sketch_filename))

input_folder = '../DataSet/Train'
output_folder = '../playground/Train'
process_images(input_folder, output_folder)
