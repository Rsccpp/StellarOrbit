# 🌍 SpaceVision AI  

### Satellite Image Analyzer for Disaster & Environmental Monitoring

SpaceVision AI is a web-based platform that analyzes satellite images using AI models to automatically detect and monitor:

---

## ✨ Features
- 🔥 Forest Fire Hotspots  
- 💧 Water Body Changes  
- 🏙️ Urban Expansion  
- 🌾 Crop & Vegetation Health (NDVI-based)  
- 🌊 Flood-Affected Regions  
- 🌡️ Land Temperature / Surface Anomalies  

It includes a FastAPI backend, modular analysis models, and a React frontend for uploading and viewing results.

---

## 📁 Project Structure

SpaceVision_AI/
├── .ipynb_checkpoints/
│   └── Train_Fire_Model-checkpoint.ipynb
│
├── kaggle/
│   └── (Kaggle datasets / configs)
│
├── backend/
│   ├── analysis/
│   │   ├── fire_detector.py
│   │   ├── water_detector.py
│   │   ├── vegetation_health.py
│   │   ├── urban_change.py
│   │   └── __init__.py
│   │
│   ├── static/
│   │   └── (static files if needed)
│   │
│   ├── uploads/
│   │   └── (uploaded images will be stored here)
│   │
│   ├── venv/
│   │   └── (virtual environment files)
│   │
│   ├── app.py
│   └── requirements.txt
│
├── fire/
│   ├── images/
│   │   ├── fire/
│   │   └── not_fire/
│   │
│   └── masks/
│
├── frontend/
│   ├── index1.html
│   ├── live-Ops.html
│   ├── mission.html
│   ├── vision.html
│   ├── weather.html
│   ├── technology.html
│   ├── script.js
│   ├── script1.js
│   ├── style.css
│   ├── style1.css
│   └── (other frontend files)
│
├── kaggle.json
├── .gitignore
└── README.md


---

## 🚀 Features

- Multi-hazard satellite analysis  
- Upload portal for image selection  
- FastAPI backend + React frontend  
- Extensible ML architecture (TensorFlow / PyTorch ready)  

---

## 🧠 How It Works

1. User uploads a satellite image  
2. Backend saves the image into `/uploads`  
3. Selected AI module runs analysis  
4. Processed result + JSON summary is returned  
5. Frontend displays insights  

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/Rsccpp/spacevision_ai.git
cd spacevision_ai

```
### 2️⃣ Backend Setup
```bash
cd backend
pip install -r requirements.txt
uvicorn app:app --reload
```
### 3️⃣ Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```

### 🤝 Contributing

Pull requests and issues are welcome!
