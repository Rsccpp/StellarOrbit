import cv2
import numpy as np
import os

def analyze_crop(image_path, output_dir):
    """
    Analyzes an image to detect healthy vegetation (crops) based on color.
    Returns a dictionary with the result path and stats.
    """
    try:
        # 1. Read the uploaded image
        img = cv2.imread(image_path)
        if img is None:
            print(f"Error: Could not read image at {image_path}")
            return None

        # 2. Convert to HSV color space
        # HSV (Hue, Saturation, Value) is better for isolating color ranges than RGB
        hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)

        # 3. Define range for 'Healthy Green' vegetation
        # Hue: 35-85 (Covers various shades of green)
        # Saturation: 40-255 (Filters out washed-out whites/grays)
        # Value: 40-255 (Filters out very dark pixels)
        lower_green = np.array([35, 40, 40])
        upper_green = np.array([85, 255, 255])

        # 4. Create a mask (1 for green pixels, 0 for others)
        mask = cv2.inRange(hsv, lower_green, upper_green)

        # 5. Clean up the mask (Optional noise removal)
        # This removes tiny random green specks that aren't real crops
        kernel = np.ones((5,5), np.uint8)
        mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel)

        # 6. Create Result Image (Green Overlay)
        # Create a green layer
        green_layer = np.zeros_like(img)
        green_layer[:] = [0, 255, 0] # BGR for Bright Green

        # Combine original image with green layer using the mask
        # Where mask is green, show the green layer with transparency
        result_img = img.copy()
        
        # Create the overlay only where the mask is active
        # We use bitwise_and to cut out the green shape
        green_areas = cv2.bitwise_and(green_layer, green_layer, mask=mask)
        
        # Blend it: 70% Original, 30% Green Overlay
        cv2.addWeighted(green_areas, 0.5, result_img, 1.0, 0, result_img)

        # 7. Save the Result
        base_filename = os.path.basename(image_path)
        result_filename = "crop_analysis_" + base_filename
        output_path = os.path.join(output_dir, result_filename)
        
        cv2.imwrite(output_path, result_img)

        # 8. Calculate Statistics
        total_pixels = img.shape[0] * img.shape[1]
        crop_pixels = cv2.countNonZero(mask)
        crop_percentage = (crop_pixels / total_pixels) * 100
        
        stats = {
            'total_pixels': total_pixels,
            'water_pixels': crop_pixels, # We re-use this key or change frontend to be dynamic. 
                                         # For now, let's map it to the existing frontend logic.
            'water_percentage': f"{crop_percentage:.2f}",
            'analysis_method': 'Vegetation Index (HSV Color Analysis)'
        }

        return {
            'result_path': f'results/{result_filename}',
            'stats': stats
        }

    except Exception as e:
        print(f"Error during crop analysis: {e}")
        return None