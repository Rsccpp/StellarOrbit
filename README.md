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
spacevision_ai/
   └── backend/
      ├── app.py
      ├──  requirements.txt
      └── analysis/
          ├── crop_analyzer.py
          ├── fire_detector.py
          ├── water_detector.py
      └── uploads/
    └── fire
        └── images
        └── masks
    ├── frontend/
│ ├── package.json
│ └── src/
│ ├── App.jsx
│ ├── components/
│ │ ├── UploadForm.jsx
│ │ └── ResultsCard.jsx
│ └── styles.css
│
├── models/
├── notebooks/
├── docker-compose.yml
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
