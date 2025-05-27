from flask import Flask, request, jsonify
from transformers import AutoTokenizer, AutoModelForCausalLM
from peft import PeftModel
import torch
import re
from flask_cors import CORS
app = Flask(__name__)
CORS(app)
BASE_MODEL = "TinyLlama/TinyLlama-1.1B-Chat-v1.0"
LORA_PATH = r"C:\Users\Asus\Desktop\nlp\my-lora-tinyllama"

tokenizer = AutoTokenizer.from_pretrained(BASE_MODEL)
base_model = AutoModelForCausalLM.from_pretrained(BASE_MODEL, torch_dtype=torch.float32) 
model = PeftModel.from_pretrained(base_model, LORA_PATH).eval()
import re
def generate_response(prompt):
    full_prompt = f"### User:\n{prompt.strip()}\n\n### Assistant:\n"
    inputs = tokenizer(full_prompt, return_tensors="pt").to("cpu")
    model.to("cpu")
    with torch.no_grad():
        outputs = model.generate(
            input_ids=inputs["input_ids"],
            attention_mask=inputs["attention_mask"],
            max_new_tokens=150,
            temperature=0.8,
            top_p=0.95,
            repetition_penalty=1.15,
            do_sample=True,
            pad_token_id=tokenizer.eos_token_id,
            eos_token_id=tokenizer.eos_token_id,
            early_stopping=True
        )
    generated_tokens = outputs[0][inputs["input_ids"].shape[1]:]
    decoded = tokenizer.decode(generated_tokens, skip_special_tokens=True).strip()
    cleaned = re.split(r"(###|##|<\|endoftext\|>)", decoded)[0].strip()

    return cleaned


@app.route("/rant", methods=["POST"])
def rant_ai():
    data = request.get_json(force=True)
    prompt = data.get("prompt", "").strip()

    if not prompt:
        return jsonify({"error": "Missing or empty 'prompt' in JSON body"}), 400

    print(f"📥 Received prompt: {prompt}")
    response = generate_response(prompt)
    return jsonify({"response": response})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
