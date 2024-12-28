




# Use a pipeline as a high-level helper
from transformers import pipeline

messages = [
    {"role": "user", "content": "Who are you?"},
]
pipe = pipeline("text-generation", model="TURKCELL/Turkcell-LLM-7b-v1")
pipe(messages)