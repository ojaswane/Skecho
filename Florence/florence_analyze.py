# florence_analyze.py
from transformers import FlorenceProcessor, FlorenceForConditionalGeneration
from PIL import Image
import torch
import json
import sys
import requests

def analyze_image(image_path_or_url):
    model_id = "microsoft/Florence-2-large"
    print("🔹 Loading Florence model... (this may take a few minutes the first time)")
    processor = FlorenceProcessor.from_pretrained(model_id)
    device = "cuda" if torch.cuda.is_available() else "cpu"
    model = FlorenceForConditionalGeneration.from_pretrained(model_id, torch_dtype=torch.float16).to(device)

    # Load image (from URL or local path)
    if image_path_or_url.startswith("http"):
        image = Image.open(requests.get(image_path_or_url, stream=True).raw)
    else:
        image = Image.open(image_path_or_url)

    task_prompt = (
        "Analyze this UI design image and extract:\n"
        "1. Brand color palette (with hex codes)\n"
        "2. Font styles (names, weights, usage)\n"
        "3. UI component color roles.\n"
        "Return clean JSON only in this format:\n"
        "{\n"
        '  \"colors\": [ {\"name\": \"\", \"hex\": \"\", \"role\": \"\"} ],\n'
        '  \"typography\": [ {\"font\": \"\", \"weight\": \"\", \"use\": \"\"} ]\n'
        "}"
    )

    inputs = processor(text=task_prompt, images=image, return_tensors="pt").to("cuda")
    generated_ids = model.generate(**inputs, max_new_tokens=500)
    output_text = processor.batch_decode(generated_ids, skip_special_tokens=True)[0]

    # Try to parse JSON safely
    try:
        parsed = json.loads(output_text)
        print(json.dumps(parsed, indent=2))
    except Exception:
        print(json.dumps({"raw_output": output_text}, indent=2))


if __name__ == "__main__":
    image_url = sys.argv[1] if len(sys.argv) > 1 else None
    if not image_url:
        print("Usage: python florence_analyze.py <image_url>")
        sys.exit(1)
    
    analyze_image(image_url)