from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, UploadFile, File, Form
from PIL import Image
from freshness_model import analyze_freshness

import pickle
import numpy as np

app = FastAPI(title="ZeroRot ML API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load trained XGBoost pricing model
with open("pricing_model.pkl", "rb") as f:
    pricing_model = pickle.load(f)


@app.get("/")
def home():
    return {
        "message": "ZeroRot ML backend is running"
    }


@app.post("/analyze")
async def analyze_product(
    file: UploadFile = File(...),
    shelf_life_days: int = Form(3),
    demand_trend: str = Form("stable"),
    stock_kg: float = Form(100),
    excess_kg: float = Form(20),
    base_price: float = Form(100)
):

    # -----------------------------
    # 1. IMAGE → FRESHNESS
    # -----------------------------

    image = Image.open(file.file)

    freshness = analyze_freshness(image)

    freshness_score = freshness["freshness_score"]


    # -----------------------------
    # 2. CONVERT DEMAND TO NUMBER
    # -----------------------------

    demand_map = {
        "declining": 0,
        "stable": 1,
        "high": 2
    }

    demand_value = demand_map.get(
        demand_trend.lower(),
        1
    )


    # -----------------------------
    # 3. CALCULATE EXCESS %
    # -----------------------------

    if stock_kg > 0:
        excess_percentage = (
            excess_kg / stock_kg
        ) * 100
    else:
        excess_percentage = 0


    # -----------------------------
    # 4. XGBOOST PRICE PREDICTION
    # -----------------------------

    features = np.array([[
        freshness_score,
        shelf_life_days,
        demand_value,
        excess_percentage,
        stock_kg,
        base_price
    ]])

    predicted_markdown = float(
        pricing_model.predict(features)[0]
    )

    predicted_markdown = max(
        0,
        min(40, predicted_markdown)
    )

    recommended_price = (
        base_price *
        (1 - predicted_markdown / 100)
    )

    recommended_price = round(
        recommended_price,
        2
    )

    predicted_markdown = round(
        predicted_markdown,
        2
    )


    # -----------------------------
    # 5. FINAL RESPONSE
    # -----------------------------

    return {
        "filename": file.filename,

        "freshness_score":
            freshness["freshness_score"],

        "fresh_probability":
            freshness["fresh_probability"],

        "rotten_probability":
            freshness["rotten_probability"],

        "quality":
            freshness["quality"],

        "status":
            freshness["status"],

        "recommended_markdown":
            predicted_markdown,

        "recommended_price":
            recommended_price,

        "base_price":
            base_price
    }