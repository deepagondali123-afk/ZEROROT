import timm
import torch
import pickle
from PIL import Image
from torchvision import transforms

# -----------------------------
# Load pretrained MobileNetV3
# -----------------------------
model = timm.create_model(
    "mobilenetv3_small_100",
    pretrained=True,
    num_classes=0
)

model.eval()


# -----------------------------
# Image preprocessing
# -----------------------------
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        [0.485, 0.456, 0.406],
        [0.229, 0.224, 0.225]
    )
])


# -----------------------------
# Load trained freshness classifier
# -----------------------------
with open("freshness_classifier.pkl", "rb") as f:
    classifier = pickle.load(f)


# -----------------------------
# Freshness analysis
# -----------------------------
def analyze_freshness(image: Image.Image):

    image = image.convert("RGB")

    # Convert image into MobileNet features
    tensor = transform(image).unsqueeze(0)

    with torch.no_grad():
        features = model(tensor)

    features = features.squeeze().numpy().reshape(1, -1)

    # Get probability for each class
    probabilities = classifier.predict_proba(features)[0]

    # Classes:
    # 0 = fresh
    # 1 = rotten

    fresh_probability = float(probabilities[0])
    rotten_probability = float(probabilities[1])

    # Convert fresh probability to 0-100 score
    freshness_score = round(fresh_probability * 100)

    # Determine quality
    if freshness_score >= 80:
        quality = "Excellent"
        status = "Suitable for sale"

    elif freshness_score >= 60:
        quality = "Good"
        status = "Suitable for sale"

    elif freshness_score >= 40:
        quality = "Moderate"
        status = "Sell soon"

    else:
        quality = "Poor"
        status = "Quality concern"

    return {
        "freshness_score": freshness_score,
        "fresh_probability": round(fresh_probability * 100, 2),
        "rotten_probability": round(rotten_probability * 100, 2),
        "quality": quality,
        "status": status
    }