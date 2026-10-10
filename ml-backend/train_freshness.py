from datasets import load_dataset
from PIL import Image
import timm
import torch
from torchvision import transforms
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import numpy as np
import pickle

print("Loading dataset...")

# Load labelled Fresh / Rotten dataset
dataset = load_dataset(
    "Project-AgML/fresh_rotten_fruit_classification"
)

print(dataset)

# Load pretrained MobileNetV3 as feature extractor
print("Loading MobileNetV3...")

model = timm.create_model(
    "mobilenetv3_small_100",
    pretrained=True,
    num_classes=0
)

model.eval()

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        [0.485, 0.456, 0.406],
        [0.229, 0.224, 0.225]
    )
])


def extract_feature(image):
    image = image.convert("RGB")
    x = transform(image).unsqueeze(0)

    with torch.no_grad():
        feature = model(x)

    return feature.squeeze().numpy()


print("Extracting image features...")

X = []
y = []

# Dataset split
data = dataset["train"]

for i, item in enumerate(data):

    image = item["image"]
    label = item["label"]

    try:
        feature = extract_feature(image)

        X.append(feature)
        y.append(label)

    except Exception as e:
        print("Skipping image:", e)

    if (i + 1) % 100 == 0:
        print(f"Processed {i + 1} images")


X = np.array(X)
y = np.array(y)

print("Feature matrix:", X.shape)
print("Labels:", y.shape)

# Train/test split
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y
)

print("Training classifier...")

classifier = LogisticRegression(
    max_iter=1000
)

classifier.fit(X_train, y_train)

# Evaluate
predictions = classifier.predict(X_test)

accuracy = accuracy_score(
    y_test,
    predictions
)

print()
print("==============================")
print("MODEL TRAINING COMPLETE")
print("==============================")
print(f"Accuracy: {accuracy * 100:.2f}%")
print("==============================")

# Save classifier
with open("freshness_classifier.pkl", "wb") as f:
    pickle.dump(classifier, f)

print("Saved: freshness_classifier.pkl")
