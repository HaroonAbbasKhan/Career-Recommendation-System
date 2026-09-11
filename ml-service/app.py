from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from difflib import get_close_matches
import joblib, json, numpy as np

app = FastAPI(title="CareerAI Pakistan ML Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

model      = joblib.load("model.pkl")
target_enc = joblib.load("target_encoder.pkl")

with open("encoders.json")      as f: encoders      = json.load(f)
with open("feature_names.json") as f: feature_names = json.load(f)

class ProfileInput(BaseModel):
    gender:              str
    ug_degree:           str
    specialization:      str
    interests:           str
    skills:              str
    cgpa:                float = Field(..., ge=0.0, le=4.0)
    has_certification:   str
    certification_title: str = "None"
    is_working:          str
    masters_field:       str = "No Masters"

def fuzzy_encode(col: str, val: str) -> int:
    classes       = encoders.get(col, [])
    classes_lower = [c.lower().strip() for c in classes]
    val_lower     = str(val).lower().strip()
    if val_lower in classes_lower:
        return classes_lower.index(val_lower)
    matches = get_close_matches(val_lower, classes_lower, n=1, cutoff=0.3)
    return classes_lower.index(matches[0]) if matches else 0

@app.get("/health")
def health():
    return {"status": "ok", "model": "Pakistan Career Recommender v2"}

@app.post("/predict")
def predict(profile: ProfileInput):
    raw = profile.model_dump()
    row = []
    for feat in feature_names:
        val = raw.get(feat, "")
        if feat in encoders:
            row.append(fuzzy_encode(feat, str(val)))
        else:
            row.append(float(val))

    proba    = model.predict_proba(np.array([row]))[0]
    top5_idx = np.argsort(proba)[::-1][:5]

    return {
        "career":     target_enc.classes_[top5_idx[0]],
        "confidence": round(float(proba[top5_idx[0]]) * 100, 1),
        "top_5": [
            {
                "career":     target_enc.classes_[i],
                "confidence": round(float(proba[i]) * 100, 1)
            }
            for i in top5_idx
        ]
    }