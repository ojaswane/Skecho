# florence_analyze.py
from transformers import AutoProcessor, AutoModelForCausalLM
from PIL import Image
import torch
import json
import sys

# Example usage:
# python https://your-image-url.com/image.png
def analyze_image(image_path_or_url):
    model_id = "microsoft/Florence-2-large"
    processor = AutoProcessor.from_pretrained(model_id)
    model = AutoModelForCausalLM.from_pretrained(model_id, torch_dtype=torch.float16, device_map="auto")

    image = Image.open(image_path_or_url) if not image_path_or_url.startswith("http") else Image.open(requests.get(image_path_or_url, stream=True).raw)

    task_prompt = (
        "Analyze this UI design image and extract:\n"
        "1. Brand color palette (with hex codes)\n"
        "2. Font styles (names, weights, usage)\n"
        "3. UI component color roles.\n"
        "Return clean JSON only in this format:\n"
        "{\n"
        '  "colors": [ {"name": "", "hex": "", "role": ""} ],\n'
        '  "typography": [ {"font": "", "weight": "", "use": ""} ]\n'
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
    else:
        analyze_image(image_url)
