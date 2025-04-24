from flask import Flask, request, jsonify
from flask_cors import CORS  
import lightgbm as lgb
import pandas as pd
import json

# Load model
model = lgb.Booster(model_file="lightgbm_model.txt")

# Load expected feature columns
with open("lgb_feature_cols.json") as f:
    feature_cols = json.load(f)

# Load best threshold
with open("lightgbm_best_threshold.json") as f:
    best_thresh = json.load(f)["threshold"]

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # ✅ Enable CORS for all origins

@app.route("/", methods=["GET"])
def root():
    return "🎯 SmartTicket AI module is live!"

@app.route("/predict", methods=["POST"])
def predict():
    try:
        # Read input JSON
        payload = request.get_json()
        df = pd.DataFrame([payload])
        df = pd.get_dummies(df)

        # Ensure all expected columns are present
        for col in feature_cols:
            if col not in df.columns:
                df[col] = 0
        df = df[feature_cols]  # Reorder to match training

        # Predict
        score = model.predict(df)[0]
        label = "suspicious" if score > best_thresh else "trusted"

        return jsonify({
            "status": label,
            "score": round(score, 3)
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ✅ This is required for Google Cloud Run (or Docker containers)
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)
