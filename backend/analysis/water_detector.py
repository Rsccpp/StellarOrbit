import cv2
import numpy as np
import os

def detect_water(image_path, output_dir):
    """
    Analyzes an image to detect water bodies and calculates statistics.
    Returns a dictionary with the result path and stats.
    """
    try:
        # Read the uploaded image
        img = cv2.imread(image_path)
        if img is None:
            print(f"Error: Could not read image at {image_path}")
            return None

        # Convert to HSV color space (often better for color detection)
        hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)

        # Define a range for 'blue' color (representing water)
        # These values would need heavy tuning for real satellite images
        # Format: [Hue, Saturation, Value]
        lower_blue = np.array([90, 100, 50])
        upper_blue = np.array([130, 255, 255])

        # Create a mask that selects only the blue pixels
        mask = cv2.inRange(hsv, lower_blue, upper_blue)

        # Create a result image: highlight detected water in bright red
        # We start with a copy of the original image
        result_img = img.copy()
        
        # Where the mask is 'white' (water detected), set the pixel to red
        result_img[mask > 0] = [0, 0, 255]  # BGR format: [Blue, Green, Red]

        # --- Save the result ---
        # Create a unique filename for the result
        base_filename = os.path.basename(image_path)
        result_filename = "water_analysis_" + base_filename
        output_path = os.path.join(output_dir, result_filename)
        
        cv2.imwrite(output_path, result_img)

        # --- (NEW) Calculate Statistics ---
        total_pixels = img.shape[0] * img.shape[1]
        water_pixels = cv2.countNonZero(mask) # Counts all non-zero (white) pixels
        water_percentage = (water_pixels / total_pixels) * 100
        
        stats = {
            'total_pixels': total_pixels,
            'water_pixels': water_pixels,
            'water_percentage': f"{water_percentage:.2f}" # Format to 2 decimal places
        }

        # --- (CHANGED) Return a dictionary ---
        return {
            'result_path': f'results/{result_filename}', # Use URL-friendly path
            'stats': stats
        }

    except Exception as e:
        print(f"Error during water detection: {e}")
        return None