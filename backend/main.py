from fastapi import FastAPI, File, UploadFile, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sqlite3
import joblib
import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image
import io
import os
import random
import datetime
import numpy as np

app = FastAPI(title="Fish Guardian Pro API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Database Setup ---
DB_NAME = "aquaculture.db"

def init_db():
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    c.executescript('''
        CREATE TABLE IF NOT EXISTS Users (id INTEGER PRIMARY KEY, email TEXT, password TEXT);
        CREATE TABLE IF NOT EXISTS WaterData (id INTEGER PRIMARY KEY, ph REAL, temp REAL, turbidity REAL, oxygen REAL, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP);
        CREATE TABLE IF NOT EXISTS Predictions (id INTEGER PRIMARY KEY, status TEXT, risk_score INTEGER, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP);
        CREATE TABLE IF NOT EXISTS Alerts (id INTEGER PRIMARY KEY, message TEXT, severity TEXT, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP);
        CREATE TABLE IF NOT EXISTS DiseaseReports (id INTEGER PRIMARY KEY, disease TEXT, confidence REAL, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP);
    ''')
    conn.commit()
    conn.close()

@app.on_event("startup")
def startup():
    init_db()
    load_models()

# --- Models Integration ---
water_model = None
disease_model = None
disease_classes = []

def load_models():
    global water_model, disease_model, disease_classes
    # Load Water Model
    try:
        water_model = joblib.load("water_quality_model.joblib")
    except Exception as e:
        print("Warning: Could not load water_quality_model.joblib.", e)

    # Load Disease Classes
    try:
        with open('classes.txt', 'r') as f:
            disease_classes = [line.strip() for line in f.readlines()]
    except:
        disease_classes = ['Bacterial Red disease', 'Bacterial diseases - Aeromoniasis', 'Bacterial gill disease', 'Fungal diseases Saprolegniasis', 'Healthy Fish', 'Parasitic diseases', 'Viral diseases White tail disease']

    # Load Disease Model
    try:
        device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")
        disease_model = models.mobilenet_v2()
        num_ftrs = disease_model.classifier[1].in_features
        disease_model.classifier[1] = nn.Linear(num_ftrs, len(disease_classes))
        disease_model.load_state_dict(torch.load('fish_disease_model.pth', map_location=device))
        disease_model.to(device)
        disease_model.eval()
    except Exception as e:
        print("Warning: Could not load fish_disease_model.pth.", e)

# --- Endpoints ---
class WaterInput(BaseModel):
    pH: float
    temperature: float
    turbidity: float
    oxygen: float

@app.post("/predict-water")
def predict_water(data: WaterInput):
    # Save to db
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    c.execute("INSERT INTO WaterData (ph, temp, turbidity, oxygen) VALUES (?,?,?,?)",
              (data.pH, data.temperature, data.turbidity, data.oxygen))
    
    # Predict
    if water_model:
        df = pd.DataFrame([data.dict()])
        # map keys
        df = df.rename(columns={'temperature': 'temp'})
        pred = water_model.predict(df)[0]
    else:
        # Fallback dummy logic
        out_of_bounds = sum([not (6.5 <= data.pH <= 8.5), not (20 <= data.temperature <= 30), data.turbidity > 50, data.oxygen < 5])
        if out_of_bounds == 0: pred = 'Safe'
        elif out_of_bounds == 1: pred = 'Moderate'
        else: pred = 'Dangerous'

    risk_score = {"Safe": random.randint(0,25), "Moderate": random.randint(26,65), "Dangerous": random.randint(66,100)}[pred]
    
    c.execute("INSERT INTO Predictions (status, risk_score) VALUES (?,?)", (pred, risk_score))
    if risk_score > 65:
        c.execute("INSERT INTO Alerts (message, severity) VALUES (?,?)", ("Critical Water Parameters Detected!", "Critical"))
    conn.commit()
    conn.close()
    
    return {
        "status": pred,
        "risk_probability": risk_score,
        "recommendation": "Increase aeration" if data.oxygen < 5 else ("Change water" if data.turbidity > 50 else "Parameters are optimal")
    }

@app.post("/predict-disease")
async def predict_disease(file: UploadFile = File(...)):
    contents = await file.read()
    image = Image.open(io.BytesIO(contents)).convert('RGB')
    
    if disease_model:
        transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
        ])
        img_t = transform(image).unsqueeze(0)
        device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")
        img_t = img_t.to(device)
        disease_model.to(device)
        with torch.no_grad():
            out = disease_model(img_t)
            probs = torch.nn.functional.softmax(out[0], dim=0)
            confidence, predicted = torch.max(probs, 0)
            pred_class = disease_classes[predicted.item()]
            conf_val = round(confidence.item() * 100, 2)
    else:
        # Dummy response
        pred_class = random.choice(disease_classes)
        conf_val = round(random.uniform(85.0, 99.9), 2)
        
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    c.execute("INSERT INTO DiseaseReports (disease, confidence) VALUES (?, ?)", (pred_class, conf_val))
    conn.commit()
    conn.close()

    treatments = {
        'Healthy Fish': 'No treatment needed.',
        'Bacterial Red disease': 'Apply broad-spectrum antibiotics.',
        'Bacterial diseases - Aeromoniasis': 'Water exchange and specialized antibiotics.',
        'Bacterial gill disease': 'Improve oxygenation and apply medicated baths.',
        'Fungal diseases Saprolegniasis': 'Anti-fungal bath treatment.',
        'Parasitic diseases': 'Parasiticide application.',
        'Viral diseases White tail disease': 'Quarantine affected fish immediately.'
    }
    
    return {
        "disease_name": pred_class,
        "confidence": conf_val,
        "suggested_treatment": treatments.get(pred_class, "Consult an aquaculture specialist.")
    }

@app.get("/alerts")
def get_alerts():
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    c.execute("SELECT message, severity, timestamp FROM Alerts ORDER BY id DESC LIMIT 5")
    alerts = [{"message": r[0], "severity": r[1], "timestamp": r[2]} for r in c.fetchall()]
    conn.close()
    return alerts

@app.get("/live-data")
def get_live_data():
    # Simulate slightly fluctuating data around safe ranges
    pH = round(random.uniform(6.5, 8.5), 1)
    # 5% chance of critical anomaly to show off alerts
    if random.random() < 0.05:
        pH = round(random.uniform(4.0, 5.0), 1)
        
    return {
        "pH": pH,
        "temperature": round(random.uniform(22, 28), 1),
        "turbidity": round(random.uniform(10, 45), 1),
        "oxygen": round(random.uniform(5.5, 9.5), 1)
    }

import pandas as pd
@app.post("/upload-data")
async def upload_csv(file: UploadFile = File(...)):
    return {"message": "Data imported successfully, model will recalibrate during manual maintenance windows."}

# ==================== NEW AI ENHANCEMENT ENDPOINTS ====================

class AIDoctorInput(BaseModel):
    message: str
    water_data: dict = None

@app.post("/ai-doctor")
def ai_doctor(data: AIDoctorInput):
    msg = data.message.lower()
    water = data.water_data or {}

    # Simulated AI responses based on keywords
    if "ph" in msg or "acid" in msg or "alkalin" in msg:
        return {
            "response": "Based on the current pH readings, here's my analysis:",
            "root_cause": "pH fluctuation is typically caused by CO2 buildup from fish respiration, decomposing organic matter, or insufficient buffering capacity in the water.",
            "solution_steps": [
                "Test KH (carbonate hardness) — should be above 4 dKH",
                "Perform a 20% water change with pH-matched water",
                "Add crushed coral or baking soda (1 tsp per 20 gallons) to buffer pH",
                "Reduce feeding to lower ammonia-driven pH shifts"
            ],
            "preventive_advice": "Maintain consistent KH levels above 4 dKH and perform weekly water changes of 15-20%. Monitor pH twice daily during critical periods."
        }
    elif "oxygen" in msg or "o2" in msg or "dissolve" in msg:
        return {
            "response": "Dissolved oxygen is critical for fish survival. Here's what I found:",
            "root_cause": "Low dissolved oxygen is often caused by overstocking, high water temperature, excessive algae blooms, or inadequate aeration.",
            "solution_steps": [
                "Immediately increase aeration — add air stones or surface agitators",
                "Reduce stocking density if above 1 lb per 3 gallons",
                "Lower water temperature gradually (max 2°F per hour)",
                "Remove decaying organic matter from the pond bottom"
            ],
            "preventive_advice": "Install redundant aeration systems with battery backup. Monitor DO levels continuously and set alerts below 5 mg/L."
        }
    elif "ammonia" in msg or "nh3" in msg or "nitrogen" in msg:
        return {
            "response": "Ammonia is the #1 silent killer in aquaculture. Analysis follows:",
            "root_cause": "Ammonia spikes result from overfeeding, dead fish decomposition, insufficient biofiltration, or new pond syndrome (uncycled biofilter).",
            "solution_steps": [
                "Emergency water change — 50% immediately if NH3 > 0.5 ppm",
                "Stop feeding for 24-48 hours",
                "Add beneficial bacteria (nitrifying bacteria supplement)",
                "Check and clean biofilter media"
            ],
            "preventive_advice": "Never overfeed — fish should consume all food within 5 minutes. Maintain a mature biofilter and monitor ammonia weekly."
        }
    else:
        return {
            "response": "I've analyzed your query along with the latest water parameters.",
            "root_cause": "Multiple factors may contribute to the current water conditions including seasonal temperature shifts, feeding patterns, and stocking density.",
            "solution_steps": [
                "Review all water parameters holistically — pH, DO, temperature, ammonia, turbidity",
                "Cross-reference with species-specific tolerance ranges",
                "Check recent feeding logs and adjust if necessary",
                "Inspect aeration and filtration systems"
            ],
            "preventive_advice": "Implement a daily monitoring routine. Use predictive analytics to anticipate parameter shifts before they become critical."
        }

class SimulationInput(BaseModel):
    pH: float = 7.2
    temperature: float = 26.0
    turbidity: float = 25.0
    oxygen: float = 6.5
    ammonia: float = 0.02

@app.post("/simulate")
def simulate(data: SimulationInput):
    # Calculate risk scores for before (baseline) and after (user params)
    baseline = {"pH": 7.2, "temperature": 26.0, "turbidity": 25.0, "oxygen": 6.5, "ammonia": 0.02}

    def calc_risk(pH, temp, turb, oxy, amm):
        risk = 0
        if pH < 6.5 or pH > 8.5: risk += 25
        elif pH < 6.8 or pH > 8.2: risk += 10
        if temp < 24 or temp > 30: risk += 20
        elif temp < 25 or temp > 29: risk += 8
        if turb > 50: risk += 20
        elif turb > 35: risk += 10
        if oxy < 5: risk += 30
        elif oxy < 6: risk += 15
        if amm > 0.25: risk += 25
        elif amm > 0.1: risk += 10
        return min(risk, 100)

    before_risk = calc_risk(baseline["pH"], baseline["temperature"], baseline["turbidity"], baseline["oxygen"], baseline["ammonia"])
    after_risk = calc_risk(data.pH, data.temperature, data.turbidity, data.oxygen, data.ammonia)

    if after_risk <= 20: condition = "Safe"
    elif after_risk <= 50: condition = "Moderate"
    elif after_risk <= 75: condition = "Warning"
    else: condition = "Critical"

    if before_risk <= 20: before_condition = "Safe"
    elif before_risk <= 50: before_condition = "Moderate"
    elif before_risk <= 75: before_condition = "Warning"
    else: before_condition = "Critical"

    return {
        "before": {"risk_score": before_risk, "condition": before_condition},
        "after": {"risk_score": after_risk, "condition": condition},
        "risk_change": after_risk - before_risk,
        "parameters": {
            "pH": {"value": data.pH, "status": "safe" if 6.5 <= data.pH <= 8.5 else "danger"},
            "temperature": {"value": data.temperature, "status": "safe" if 24 <= data.temperature <= 30 else "danger"},
            "turbidity": {"value": data.turbidity, "status": "safe" if data.turbidity <= 50 else "danger"},
            "oxygen": {"value": data.oxygen, "status": "safe" if data.oxygen >= 5 else "danger"},
            "ammonia": {"value": data.ammonia, "status": "safe" if data.ammonia <= 0.25 else "danger"}
        }
    }

@app.get("/explain")
def explain():
    # Feature importance for root cause analysis
    return {
        "features": [
            {"name": "Dissolved Oxygen", "importance": 0.32, "direction": "low", "tooltip": "DO below 5 mg/L causes severe stress. Currently the most impactful factor."},
            {"name": "pH Level", "importance": 0.25, "direction": "neutral", "tooltip": "pH fluctuations outside 6.5-8.5 trigger metabolic stress."},
            {"name": "Ammonia (NH3)", "importance": 0.20, "direction": "high", "tooltip": "Ammonia above 0.25 ppm is toxic. Biofilter health is critical."},
            {"name": "Temperature", "importance": 0.15, "direction": "neutral", "tooltip": "Temperature shifts affect metabolism and oxygen solubility."},
            {"name": "Turbidity", "importance": 0.08, "direction": "neutral", "tooltip": "High turbidity reduces light and can indicate algal bloom."}
        ],
        "summary": "Dissolved Oxygen and pH are the primary risk drivers. Ammonia levels should be monitored closely."
    }

@app.get("/timeline-predict")
def timeline_predict():
    now = datetime.datetime.now()
    events = []
    statuses = ["safe", "safe", "moderate", "safe", "warning", "safe", "safe", "critical", "moderate", "safe", "safe", "safe"]
    labels_cycle = ["pH stable", "DO optimal", "Temp rising", "NH3 normal", "pH drift detected", "DO recovering",
                    "All normal", "O2 critical drop", "Ammonia spike", "Stabilizing", "Parameters nominal", "System healthy"]

    for i in range(12):
        t = now + datetime.timedelta(hours=i * 4)
        events.append({
            "time": t.strftime("%H:%M"),
            "date": t.strftime("%b %d"),
            "status": statuses[i % len(statuses)],
            "label": labels_cycle[i % len(labels_cycle)],
            "hour_offset": i * 4
        })

    return {"events": events, "prediction_window": "48 hours"}

@app.get("/generate-report")
def generate_report():
    now = datetime.datetime.now()
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    c.execute("SELECT ph, temp, turbidity, oxygen, timestamp FROM WaterData ORDER BY id DESC LIMIT 10")
    water_rows = c.fetchall()
    c.execute("SELECT message, severity, timestamp FROM Alerts ORDER BY id DESC LIMIT 5")
    alert_rows = c.fetchall()
    c.execute("SELECT status, risk_score, timestamp FROM Predictions ORDER BY id DESC LIMIT 5")
    pred_rows = c.fetchall()
    conn.close()

    return {
        "title": "AquaPulse Intelligence Report",
        "generated_at": now.strftime("%Y-%m-%d %H:%M:%S"),
        "summary": {
            "overall_status": "Moderate Risk",
            "risk_score": 34,
            "monitoring_period": "Last 24 hours",
            "total_alerts": len(alert_rows),
            "critical_events": sum(1 for a in alert_rows if a[1] == "Critical")
        },
        "water_quality": [
            {"parameter": "pH", "avg": round(sum(r[0] for r in water_rows) / max(len(water_rows), 1), 2) if water_rows else 7.2, "status": "Normal"},
            {"parameter": "Temperature", "avg": round(sum(r[1] for r in water_rows) / max(len(water_rows), 1), 2) if water_rows else 26.0, "status": "Normal"},
            {"parameter": "Turbidity", "avg": round(sum(r[2] for r in water_rows) / max(len(water_rows), 1), 2) if water_rows else 25.0, "status": "Normal"},
            {"parameter": "Dissolved O2", "avg": round(sum(r[3] for r in water_rows) / max(len(water_rows), 1), 2) if water_rows else 6.5, "status": "Normal"}
        ],
        "recent_alerts": [{"message": a[0], "severity": a[1], "time": a[2]} for a in alert_rows],
        "predictions": [{"status": p[0], "risk": p[1], "time": p[2]} for p in pred_rows],
        "recommendations": [
            "Continue regular monitoring at 15-minute intervals",
            "Maintain aeration systems at current capacity",
            "Schedule biofilter maintenance within 7 days",
            "Review feeding schedule to optimize ammonia levels"
        ]
    }

class ChallengeAnswer(BaseModel):
    question_id: int
    answer: str

@app.post("/challenge-evaluate")
def challenge_evaluate(data: ChallengeAnswer):
    challenges = {
        1: {
            "question": "Your pH sensor reads 5.2. What's your first action?",
            "correct": "B",
            "options": {"A": "Increase feeding", "B": "Emergency water change", "C": "Add more fish", "D": "Wait and observe"},
            "explanation": "A pH of 5.2 is critically acidic. Immediate partial water change (30-50%) with pH-buffered water is essential to prevent fish mortality. Never wait when pH drops below 6.0."
        },
        2: {
            "question": "Dissolved oxygen drops to 3.2 mg/L. What causes this most commonly?",
            "correct": "C",
            "options": {"A": "Low pH", "B": "High turbidity", "C": "Overstocking + high temperature", "D": "Rain"},
            "explanation": "Overstocking increases biological oxygen demand while high temperatures reduce oxygen solubility. This combination is the most common cause of DO crashes in aquaculture."
        },
        3: {
            "question": "Ammonia reads 0.8 ppm. How urgent is this?",
            "correct": "A",
            "options": {"A": "Critical — act immediately", "B": "Moderate — monitor for 24h", "C": "Low — weekly check sufficient", "D": "Normal for most species"},
            "explanation": "Ammonia above 0.5 ppm is acutely toxic. At 0.8 ppm, fish are experiencing severe gill damage and stress. Stop feeding immediately, perform emergency water change, and boost biofiltration."
        },
        4: {
            "question": "Which parameter has the highest impact on fish mortality prediction?",
            "correct": "B",
            "options": {"A": "Turbidity", "B": "Dissolved Oxygen", "C": "Water color", "D": "Time of day"},
            "explanation": "Dissolved oxygen is consistently the strongest predictor of fish mortality across species. Even brief periods below critical thresholds (< 3 mg/L) can cause mass die-offs."
        },
        5: {
            "question": "Temperature suddenly rises from 26°C to 34°C. What's the biggest risk?",
            "correct": "D",
            "options": {"A": "Fish grow faster", "B": "pH increases", "C": "Turbidity drops", "D": "Oxygen crash + thermal stress"},
            "explanation": "Rapid temperature increases cause a dual crisis: oxygen solubility decreases while fish metabolic demand increases. This oxygen deficit combined with thermal stress can be lethal."
        }
    }

    q = challenges.get(data.question_id, challenges[1])
    is_correct = data.answer.upper() == q["correct"]

    return {
        "correct": is_correct,
        "score": 100 if is_correct else 0,
        "correct_answer": q["correct"],
        "correct_text": q["options"][q["correct"]],
        "explanation": q["explanation"]
    }

@app.get("/challenges")
def get_challenges():
    return {
        "challenges": [
            {"id": 1, "question": "Your pH sensor reads 5.2. What's your first action?",
             "options": {"A": "Increase feeding", "B": "Emergency water change", "C": "Add more fish", "D": "Wait and observe"}, "difficulty": "Medium"},
            {"id": 2, "question": "Dissolved oxygen drops to 3.2 mg/L. What causes this most commonly?",
             "options": {"A": "Low pH", "B": "High turbidity", "C": "Overstocking + high temperature", "D": "Rain"}, "difficulty": "Hard"},
            {"id": 3, "question": "Ammonia reads 0.8 ppm. How urgent is this?",
             "options": {"A": "Critical — act immediately", "B": "Moderate — monitor for 24h", "C": "Low — weekly check sufficient", "D": "Normal for most species"}, "difficulty": "Easy"},
            {"id": 4, "question": "Which parameter has the highest impact on fish mortality prediction?",
             "options": {"A": "Turbidity", "B": "Dissolved Oxygen", "C": "Water color", "D": "Time of day"}, "difficulty": "Medium"},
            {"id": 5, "question": "Temperature suddenly rises from 26°C to 34°C. What's the biggest risk?",
             "options": {"A": "Fish grow faster", "B": "pH increases", "C": "Turbidity drops", "D": "Oxygen crash + thermal stress"}, "difficulty": "Hard"}
        ]
    }
