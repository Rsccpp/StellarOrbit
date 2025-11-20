import os
from flask import Flask, request, jsonify, send_from_directory, url_for
from flask_cors import CORS
from werkzeug.utils import secure_filename
from analysis.water_detector import detect_water # Import our "AI" function
from analysis.crop_analyzer import analyze_crop # <--- ADD THIS IMPORT
from analysis.fire_detector import detect_fire

# --- Configuration ---
UPLOAD_FOLDER = 'uploads'
RESULT_FOLDER = os.path.join('static', 'results')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'tif', 'tiff'}

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['RESULT_FOLDER'] = RESULT_FOLDER
CORS(app) # Allows our frontend to talk to our backend

# Create directories if they don't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(RESULT_FOLDER, exist_ok=True)

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# --- API Endpoint for Water Analysis ---
@app.route('/analyze/water', methods=['POST'])
def analyze_water_endpoint():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        upload_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(upload_path)

        # --- (CHANGED) Call the Analysis Function ---
        # It now returns a dictionary with 'result_path' and 'stats'
        analysis_data = detect_water(upload_path, app.config['RESULT_FOLDER'])
        
        if analysis_data is None:
            return jsonify({'error': 'Could not process image'}), 500

        # Get the relative path from the dictionary
        result_image_path = analysis_data['result_path']
        
        # Get the stats from the dictionary
        stats_data = analysis_data['stats']

        # Return the *full URL* to the resulting image
        result_url = url_for('static', filename=result_image_path, _external=True)
        
        # --- (CHANGED) Add stats to the JSON response ---
        return jsonify({
            'message': 'Analysis complete',
            'result_url': result_url,
            'stats': stats_data  # Pass the stats dictionary
        })
    else:
        return jsonify({'error': 'File type not allowed'}), 400

# --- NEW ROUTE FOR CROP ANALYSIS ---
@app.route('/analyze/crop', methods=['POST'])
def analyze_crop_endpoint():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        upload_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(upload_path)

        # Call the Crop Analysis Function
        analysis_data = analyze_crop(upload_path, app.config['RESULT_FOLDER'])
        
        if analysis_data is None:
            return jsonify({'error': 'Could not process image'}), 500

        result_url = url_for('static', filename=analysis_data['result_path'], _external=True)
        
        return jsonify({
            'message': 'Analysis complete',
            'result_url': result_url,
            'stats': analysis_data['stats']
        })
    else:
        return jsonify({'error': 'File type not allowed'}), 400


# --- NEW ROUTE FOR FIRE DETECTOR ---
@app.route('/analyze/fire', methods=['POST'])
def analyze_fire_endpoint():
    # (Copy the exact same logic from your /analyze/water endpoint)
    # Just change:
    # 1. detect_water(...) -> detect_fire(...)
    # 2. Return result
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
        
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        upload_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(upload_path)

        # --- Call Fire Detector ---
        analysis_data = detect_fire(upload_path, app.config['RESULT_FOLDER'])
        
        if analysis_data is None:
            return jsonify({'error': 'Could not process image'}), 500

        result_url = url_for('static', filename=analysis_data['result_path'], _external=True)
        
        return jsonify({
            'message': 'Analysis complete',
            'result_url': result_url,
            'stats': analysis_data['stats']
        })
    else:
        return jsonify({'error': 'File type not allowed'}), 400

# --- Serve Frontend ---
# This part serves your index.html from the *sibling* 'frontend' folder
@app.route('/')
def serve_index():
    return send_from_directory('../frontend', 'index1.html')

@app.route('/mission')
def serve_mission():
    return send_from_directory('../frontend', 'mission.html')


@app.route('/<path:filename>')
def serve_frontend_files(filename):
    # This serves style.css and script.js
    return send_from_directory('../frontend', filename)

if __name__ == '__main__':
    # 'static_folder' is automatically served by Flask at /static
    # so our results in /static/results are accessible
    app.run(debug=True, port=5000)