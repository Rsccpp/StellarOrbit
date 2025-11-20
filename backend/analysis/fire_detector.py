import cv2
import numpy as np
import os
import tensorflow as tf

# --- 1. Load the AI Model (Run once when server starts) ---
try:
    # This looks for 'fire_detection_model.h5' in the SAME folder as this script
    MODEL_PATH = os.path.join(os.path.dirname(__file__), 'fire_detection_model.h5')
    model = tf.keras.models.load_model(MODEL_PATH)
    print("--- Fire Detection model loaded successfully ---")
except Exception as e:
    print(f"Error loading fire model: {e}")
    print("Did you copy 'fire_detection_model.h5' into backend/analysis/?")
    model = None

# The size your AI expects
IMG_WIDTH = 256
IMG_HEIGHT = 256

def detect_fire(image_path, output_dir):
    """
    Analyzes an image using the trained U-Net model to detect fire.
    Returns a dictionary with the result path and stats.
    """
    if model is None:
        print("Error: Model not loaded. Cannot perform analysis.")
        return None

    try:
        # --- 2. Read Image ---
        img_bgr = cv2.imread(image_path) # OpenCV loads as BGR
        if img_bgr is None:
            print(f"Error: Could not read image at {image_path}")
            return None

        # Get original dimensions so we can resize the mask back later
        original_h, original_w = img_bgr.shape[:2]

        # --- 3. Preprocess for AI (CRITICAL STEP) ---
        # Convert BGR (OpenCV) to RGB (TensorFlow/Training format)
        img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
        
        # Resize to 256x256 (what the model expects)
        img_resized = cv2.resize(img_rgb, (IMG_WIDTH, IMG_HEIGHT))
        
        # Normalize pixel values to 0-1
        img_norm = img_resized / 255.0
        
        # Add batch dimension (1, 256, 256, 3)
        img_batch = np.expand_dims(img_norm, axis=0)

        # --- 4. Make Prediction ---
        # The model returns a probability map (0 to 1)
        pred_mask = model.predict(img_batch)[0]
        
        # Threshold: Any pixel > 0.3 (30% confidence) is considered fire
        # We use 0.3 instead of 0.5 to be slightly more sensitive
        pred_mask_binary = (pred_mask > 0.3).astype(np.uint8) * 255

        # --- 5. Create Visualization ---
        # Resize the prediction mask back to the ORIGINAL image size
        mask_resized = cv2.resize(pred_mask_binary, (original_w, original_h), interpolation=cv2.INTER_NEAREST)
        
        # Create a Red Overlay
        # We make a black image, then turn the 'fire' pixels Red
        fire_overlay = np.zeros_like(img_bgr)
        fire_overlay[mask_resized > 0] = [0, 0, 255] # BGR: [Blue, Green, Red]

        # Blend the Original Image + Red Overlay
        # alpha=1.0 (Original), beta=0.4 (Overlay)
        result_img = cv2.addWeighted(img_bgr, 1.0, fire_overlay, 0.4, 0)

        # --- 6. Save Result ---
        base_filename = os.path.basename(image_path)
        result_filename = "fire_analysis_" + base_filename
        output_path = os.path.join(output_dir, result_filename)
        
        cv2.imwrite(output_path, result_img)

        # --- 7. Calculate Statistics ---
        total_pixels = original_w * original_h
        fire_pixels = cv2.countNonZero(mask_resized)
        fire_percentage = (fire_pixels / total_pixels) * 100
        
        stats = {
            'total_pixels': total_pixels,
            'water_pixels': fire_pixels, # Frontend looks for 'water_pixels' key
            'water_percentage': f"{fire_percentage:.2f}",
            'analysis_method': 'Deep Learning (U-Net)'
        }

        # --- 8. Return Data ---
        return {
            'result_path': f'results/{result_filename}',
            'stats': stats
        }

    except Exception as e:
        print(f"Error during fire detection: {e}")
        return None