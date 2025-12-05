import os
import cv2
import numpy as np
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename

# --- AI IMPORTS ---
# Only import these if you have tensorflow installed
try:
    from tensorflow.keras.models import load_model
    from tensorflow.keras.preprocessing.image import img_to_array
    AI_AVAILABLE = True
except ImportError:
    print("⚠ TensorFlow not found. AI features will be disabled.")
    AI_AVAILABLE = False

app = Flask(__name__)
CORS(app)

# --- CONFIGURATION ---
# Get the absolute path to the backend folder
BASE_DIR = os.path.abspath(os.path.dirname(__file__))

# Define Paths
UPLOAD_FOLDER = os.path.join(BASE_DIR, 'uploads')
STATIC_FOLDER = os.path.join(BASE_DIR, 'static')
RESULT_FOLDER = os.path.join(STATIC_FOLDER, 'results')
FRONTEND_FOLDER = os.path.join(BASE_DIR, '../frontend')

# CORRECT PATH FOR MODEL: backend/analysis/fire_detection_model.h5
MODEL_PATH = os.path.join(BASE_DIR, 'analysis', 'fire_detection_model.h5')

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['RESULT_FOLDER'] = RESULT_FOLDER
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'tif', 'tiff', 'webp'}

# Create directories if they don't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(RESULT_FOLDER, exist_ok=True)

# --- LOAD AI MODEL ---
fire_model = None
if AI_AVAILABLE and os.path.exists(MODEL_PATH):
    print(f"Loading AI Model from: {MODEL_PATH}")
    try:
        fire_model = load_model(MODEL_PATH)
        print("✅ Fire Detection Model Loaded Successfully!")
    except Exception as e:
        print(f"❌ Error loading model: {e}")
else:
    print(f"⚠ Model not found at {MODEL_PATH} or TensorFlow missing. Using fallback logic.")

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# --- IMAGE PROCESSING LOGIC ---
def process_image(filepath, analysis_type):
    img = cv2.imread(filepath)
    if img is None:
        return None, None

    processed_img = img.copy()
    
    # 1. FIX: Cast total_pixels to Python int immediately
    total_pixels = int(img.shape[0] * img.shape[1])
    
    detected_pixels = 0
    method = "Color Spectrum Analysis"

    # --- 1. WATER DETECTION ---
    if analysis_type == 'water':
        method = "Spectral Water Detection"
        lower_bound = np.array([100, 50, 50])
        upper_bound = np.array([255, 255, 255])
        mask = cv2.inRange(img, lower_bound, upper_bound)
        processed_img[mask > 0] = [0, 0, 255]
        
        # FIX: Cast to int
        detected_pixels = int(np.count_nonzero(mask))

    # --- 2. FIRE DETECTION ---
    elif analysis_type == 'fire':
        used_ai = False
        if fire_model:
            method = "Deep Learning (CNN)"
            try:
                target_size = (224, 224) 
                rgb_img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
                resized = cv2.resize(rgb_img, target_size)
                img_array = img_to_array(resized)
                img_array = np.expand_dims(img_array, axis=0)
                img_array = img_array / 255.0

                prediction = fire_model.predict(img_array)
                # FIX: Cast numpy float to python float
                confidence = float(prediction[0][0]) 

                if confidence > 0.5:
                    h, w, _ = img.shape
                    cv2.rectangle(processed_img, (50, 50), (w-50, h-50), (0, 0, 255), 5)
                    cv2.putText(processed_img, f"FIRE: {round(confidence*100)}%", (50, 40), 
                               cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
                    detected_pixels = total_pixels # Is already int
                else:
                    cv2.putText(processed_img, "NO FIRE", (50, 40), 
                               cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
                
                used_ai = True
            except Exception as e:
                print(f"AI Failed: {e}")
                method = "AI Failed - Using Fallback"
        
        # Fallback Logic
        if not used_ai:
            method = "Thermal Hotspot (Fallback)"
            hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
            lower_red1 = np.array([0, 70, 50])
            upper_red1 = np.array([10, 255, 255])
            mask = cv2.inRange(hsv, lower_red1, upper_red1)
            processed_img[mask > 0] = [0, 255, 0]
            
            # FIX: Cast to int (This was likely your error source)
            detected_pixels = int(np.count_nonzero(mask))

    # --- 3. CROP DETECTION ---
    elif analysis_type == 'crop':
        method = "NDVI Vegetation Index"
        hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
        lower_green = np.array([35, 40, 40])
        upper_green = np.array([85, 255, 255])
        mask = cv2.inRange(hsv, lower_green, upper_green)
        processed_img[mask > 0] = [0, 0, 255]
        
        # FIX: Cast to int
        detected_pixels = int(np.count_nonzero(mask))

    # Calculation
    if total_pixels > 0:
        percentage = round((detected_pixels / total_pixels) * 100, 2)
    else:
        percentage = 0.0

    stats = {
        'total_pixels': total_pixels,
        'water_pixels': detected_pixels,
        'water_percentage': percentage,
        'analysis_method': method
    }

    return processed_img, stats

# --- API ENDPOINT ---
@app.route('/analyze/<analysis_type>', methods=['POST'])
def analyze_endpoint(analysis_type):
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if file and allowed_file(file.filename):
        try:
            # 1. Save Raw Upload
            filename = secure_filename(file.filename)
            upload_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(upload_path)
            print(f"✅ Input saved: {upload_path}")

            # 2. Process Image
            processed_img, stats = process_image(upload_path, analysis_type)
            
            if processed_img is None:
                return jsonify({'error': 'Could not read image data'}), 500

            # 3. Save Result
            output_filename = f"result_{analysis_type}_{filename}"
            result_path = os.path.join(app.config['RESULT_FOLDER'], output_filename)
            cv2.imwrite(result_path, processed_img)
            print(f"✅ Result saved: {result_path}")

            # 4. Generate URL
            result_url = f"http://127.0.0.1:5000/static/results/{output_filename}"

            return jsonify({
                'message': 'Analysis complete',
                'result_url': result_url,
                'stats': stats
            })

        except Exception as e:
            print(f"❌ Error: {e}")
            return jsonify({'error': str(e)}), 500
    else:
        return jsonify({'error': 'File type not allowed'}), 400

# --- FRONTEND ROUTES ---
@app.route('/')
def serve_index():
    if os.path.exists(os.path.join(FRONTEND_FOLDER, 'index.html')):
        return send_from_directory(FRONTEND_FOLDER, 'index.html')
    return send_from_directory(FRONTEND_FOLDER, 'index1.html')

@app.route('/<path:filename>')
def serve_static_files(filename):
    return send_from_directory(FRONTEND_FOLDER, filename)

if __name__ == '__main__':
    print("🚀 StellarOrbit Backend Initialized...")
    app.run(debug=True, port=5000)