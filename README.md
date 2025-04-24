# SmartTicket AI System

This project is developed for the final phase of the SCAI Hackathon (Smart Stadiums & Fan Experience Track). It includes a complete AI-powered fraud detection pipeline, secure ticket marketplace, and a live QR-scanning web application. All components are organized into four main folders.

## Folder Structure

### 1. ai-lightgbm-api
This folder contains the core AI module (LightGBM-based) trained to detect suspicious ticket purchases.

**Technologies Used:**
- Python
- LightGBM
- Flask (with Flask-CORS)
- Gunicorn
- Docker
- Google Cloud Run

**Features:**
- Trained with a 200K-row realistic dummy dataset simulating fraud behavior
- One-hot encoded categorical features
- Dynamic threshold optimization using F1-score
- Deployed as a serverless API using Cloud Run
- Accepts POST requests with ticket JSON and returns a prediction ("trusted" or "suspicious")

### 2. AIModulesTesting
This folder includes code and notebooks used during the development and evaluation of the AI model.

**Contents:**
- Colab-compatible training and evaluation code
- AUC/ROC and precision-recall metrics
- Comparison between CatBoost and LightGBM
- Optimization and saving of the best threshold and feature columns
- Exported models: `lightgbm_model.txt`, `lgb_feature_cols.json`, `lightgbm_best_threshold.json`

### 3. sellingTickets-Website
This is a secure, modern website integrated with Supabase for managing events and ticket sales.

**Technologies Used:**
- Lovable (No-code/Low-code builder)
- Supabase (backend as a service)

**Features:**
- Browse and purchase event tickets securely
- Users can list tickets for resale
- Tracks user behavior and purchase/resale data
- Helps generate realistic datasets for AI model improvement

### 4. web-app-platform(QrScanner)
This is a web application that allows event staff to scan ticket QR codes and get real-time fraud predictions.

**Technologies Used:**
- HTML
- JavaScript
- html5-qrcode (QR scanning library)

**Features:**
- Mobile-friendly and runs directly in the browser
- Custom "Start Scanning" button
- Automatically sends scanned QR data (JSON) to the AI API
- Displays prediction result and model confidence

## API Endpoint
The deployed LightGBM model is hosted at:
```
POST https://lightgbm-api-1069270133726.us-central1.run.app/predict
```
**Request:**
Send a JSON object matching the ticket feature format (as embedded in the QR code).

**Response:**
```json
{
  "status": "trusted" or "suspicious",
  "score": 0.732
}
```

**Live Site:**
```
https://khalidalhmod.github.io/AI-website/
and the another website for selling the tickets we deploy it localy
```

## Performance Summary
- Final dataset size: 200,000 tickets
- Accuracy: ~95%
- AUC: ~0.75
- Balanced fraud detection with optimized threshold

## Tools Used
- Google Colab
- Google Cloud Run
- Firebase CLI
- GitHub Actions (CI/CD)
- Postman (for API testing)
- VS Code + Live Server
- Python QR Code Generator

## Purpose
This system provides a complete pipeline for:
- Selling tickets securely
- Scanning and validating tickets at entry gates
- Detecting fraud in real-time using a custom-trained AI model

---

Feel free to explore each folder for detailed source code, configuration files, and deployment instructions.

