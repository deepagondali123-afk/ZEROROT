import numpy as np
import xgboost as xgb
import pickle

print("Creating pricing training data...")

# Features:
# freshness_score
# shelf_life_days
# demand_trend
# excess_percentage
# stock_kg
# base_price

X = []
y = []

np.random.seed(42)

for _ in range(3000):

    freshness = np.random.randint(20, 101)
    shelf_life = np.random.randint(1, 15)
    demand = np.random.choice([0, 1, 2])
    stock = np.random.randint(20, 1000)
    excess = np.random.randint(0, stock + 1)
    base_price = np.random.randint(20, 500)

    excess_percentage = (excess / stock) * 100

    # Pricing logic used to create prototype training targets
    markdown = 5

    if freshness < 50:
        markdown += 15
    elif freshness < 70:
        markdown += 8

    if shelf_life <= 2:
        markdown += 10
    elif shelf_life <= 4:
        markdown += 5

    if demand == 0:       # declining
        markdown += 8
    elif demand == 2:     # high
        markdown -= 5

    if excess_percentage > 50:
        markdown += 10
    elif excess_percentage > 30:
        markdown += 5

    markdown = max(0, min(40, markdown))

    X.append([
        freshness,
        shelf_life,
        demand,
        excess_percentage,
        stock,
        base_price
    ])

    y.append(markdown)

X = np.array(X)
y = np.array(y)

print("Training XGBoost pricing model...")

model = xgb.XGBRegressor(
    n_estimators=200,
    max_depth=5,
    learning_rate=0.05,
    objective="reg:squarederror",
    random_state=42
)

model.fit(X, y)

print()
print("==============================")
print("PRICING MODEL TRAINED")
print("==============================")

with open("pricing_model.pkl", "wb") as f:
    pickle.dump(model, f)

print("Saved: pricing_model.pkl")