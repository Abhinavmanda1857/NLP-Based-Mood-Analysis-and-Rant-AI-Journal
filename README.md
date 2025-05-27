# 🧠 NLP-Based Mood Analysis and Rant AI Journal  
**Aiding Mental Health Awareness**

---

## 📝 Overview

**Rant AI** is a full-stack mental health support platform powered by Natural Language Processing (NLP). It includes a fine-tuned large language model that offers empathetic responses to users’ rants and performs mood analysis. Built to support students and individuals going through emotional stress, this system provides a safe, responsive, and ethical AI-powered outlet for journaling and mental health expression.

---

## 🚀 Key Features

- 🤖 **Fine-tuned LLM (TinyLLaMA + LoRA)** trained on emotional-support and rant-style datasets
- 💬 **Empathetic Chatbot** that responds to users' vented emotions with care
- 🛑 **Suicide/Distress Filter** to catch and respond responsibly to sensitive content
- 🌈 **Mood Analysis Engine** (BERT-based) for sentiment tracking and awareness
- 🗃️ **PostgreSQL Journal Storage** for logging and retrieving daily rants
- 🌐 **Frontend + Backend** using HTML, CSS, JS and Flask API
- ☁️ CPU-compatible & lightweight for personal deployment

---

---

## 🛠️ Installation & Running

### 1. Clone Repo

```bash
git clone https://github.com/yourusername/nlp-mood-rantai.git
cd nlp-mood-rantai
```

### 2. Install Python Requirements

```bash
cd backend
pip install -r requirements.txt
```

### 3. Run Flask API

```bash
python app.py
```

### 4. Open Frontend

Navigate to `frontend/index.html` in your browser.



## 🧠 Model Details

- **Base Model**: `TinyLLaMA/TinyLLaMA-1.1B-Chat`
- **Finetuning**: LoRA on custom rant-style prompts and emotional datasets (DailyDialog, Reddit)
- **Prompt Format**:
  ```
  ### User:
  I feel like I'm under constant pressure.

  ### Assistant:
  That sounds overwhelming. You're doing your best, and that matters. What’s been the hardest part for you?
  ```
- **Mood Classifier**: BERT model trained on emotion-labeled data (optional)

---

## 🔐 Safety Filter

Sensitive patterns (e.g., suicidal ideation, self-harm) are detected using regex and filtered before generation. Rant AI replies with a safe, empathetic message encouraging help:

```text
"I'm really sorry you're feeling this way. Please talk to someone you trust or call a support line. You’re not alone."
```

---

## 🧪 Sample Interaction

```text
User: I can't keep up with everything anymore.
Assistant: I'm really sorry you're going through this. Take one step at a time—you're not alone. What’s weighing on you most right now?
```

---

## 🛤️ Future Enhancements

- Add journaling calendar dashboard
- Integrate OpenAI Whisper for voice-to-rant
- Daily mood trend visualization
- Optional therapist handoff feature

---

## 🙌 Acknowledgments

- Hugging Face Datasets (DailyDialog, Reddit, Emotional Support Chat)
- TinyLLaMA & PEFT for LoRA training
- BERT & Scikit-Learn for Mood Classification

---
