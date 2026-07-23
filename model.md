# Using the CatVTON Hugging Face Space API

This guide explains how to integrate the public **CatVTON Hugging Face Space** into your application to generate on-model product images.

---

# Overview

The CatVTON Space exposes an official Gradio API, so you can call it directly from your backend without hosting the model yourself.

Pipeline:

```text
React Frontend
        │
        ▼
FastAPI Backend
        │
        ▼
CatVTON Hugging Face Space
        │
        ▼
Generated Image
        │
        ▼
Backend
        │
        ▼
Frontend
```

---

# Installation

Install the Gradio client.

```bash
pip install gradio_client
```

---

# Connect to the Space

```python
from gradio_client import Client

client = Client("zhengchong/CatVTON")
```

---

# View Available APIs

```python
client.view_api()
```

Output:

```
Loaded as API: https://zhengchong-catvton.hf.space
```

The API exposes several endpoints.

The two endpoints required for virtual try-on are:

```
/person_example_fn

/submit_function
```

---

# Step 1 — Prepare the Person Image

CatVTON first converts the uploaded model image into an internal `ImageEditor` representation.

```python
from gradio_client import Client, handle_file

client = Client("zhengchong/CatVTON")

person = client.predict(
    image_path=handle_file("female_front.png"),
    api_name="/person_example_fn"
)
```

The returned object looks similar to:

```python
{
    "background": "...",
    "layers": [...],
    "composite": "...",
    "id": "..."
}
```

This object is passed directly into the next API call.

---

# Step 2 — Run Virtual Try-On

```python
result = client.predict(
    person_image=person,
    cloth_image=handle_file("shirt.png"),
    cloth_type="upper",
    num_inference_steps=30,
    guidance_scale=2.5,
    seed=42,
    show_type="result only",
    api_name="/submit_function"
)
```

The returned object contains the generated image.

Example:

```python
{
    "path": "/tmp/gradio/output.png",
    "url": None
}
```

---

# Save the Result

```python
import shutil

shutil.copy(
    result["path"],
    "output.png"
)
```

---

# Recommended Settings

For e-commerce product listings:

```python
cloth_type="upper"

num_inference_steps=20

guidance_scale=2.5

seed=42

show_type="result only"
```

Reducing inference steps from **50 → 20** significantly lowers latency while maintaining good visual quality.

---

# Clothing Types

### Upper Body

```python
cloth_type="upper"
```

Examples:

- Shirts
- T-shirts
- Hoodies
- Jackets

---

### Lower Body

```python
cloth_type="lower"
```

Examples:

- Jeans
- Pants
- Shorts
- Skirts

---

### Full Body

```python
cloth_type="overall"
```

Examples:

- Dresses
- Jumpsuits
- One-piece outfits

---

# Backend Workflow

```text
Upload Model Image
        │
        ▼
Upload Garment Image
        │
        ▼
/person_example_fn
        │
        ▼
ImageEditor Object
        │
        ▼
/submit_function
        │
        ▼
Generated Image
        │
        ▼
Save Image
        │
        ▼
Return Image URL
```

---

# Multiple Views

Suppose you have these reusable base models:

```
female_front.png

female_side.png

female_back.png
```

Generate three catalog images.

```python
front = generate(front_model, shirt)

side = generate(side_model, shirt)

back = generate(back_model, shirt)
```

Output:

```
Front View

Side View

Back View
```

---

# Suggested Architecture

```text
React Frontend
        │
        ▼
FastAPI Backend
        │
        ├── Image Validation
        ├── Background Removal
        ├── Garment Detection
        │
        ▼
CatVTON Hugging Face Space
        │
        ▼
Generated Product Image
        │
        ▼
Cloud Storage / Local Storage
        │
        ▼
Return URL
```

---

# Error Handling

Since the CatVTON Space is publicly hosted:

- It may be busy.
- Requests may queue.
- The Space may restart.
- Temporary downtime is possible.

Recommended practices:

- Retry failed requests with exponential backoff.
- Configure request timeouts.
- Cache generated images.
- Keep CatVTON calls isolated behind a service layer so you can replace the backend later.

---

# Advantages

- No GPU required.
- No model deployment.
- Simple integration.
- Completely free for development and hackathons.
- Official Gradio API.
- Easy migration to self-hosted CatVTON later.

---

# Limitations

- Public community-hosted Space.
- Subject to rate limits.
- Queue delays during peak usage.
- Not suitable for production-scale workloads.
- Availability depends on the Space owner.

---

# Final Flow

```text
                React Frontend
                        │
                        ▼
               FastAPI Backend
                        │
            Upload Person + Garment
                        │
                        ▼
        CatVTON Hugging Face Space
                        │
      /person_example_fn
                        │
                        ▼
          ImageEditor Representation
                        │
      /submit_function
                        │
                        ▼
         Generated Try-On Image
                        │
                        ▼
         Save Image (S3/Cloudinary/Disk)
                        │
                        ▼
              Return Image URL
                        │
                        ▼
                 React Frontend
```

---

# Production Recommendation

For a hackathon or MVP, using the public CatVTON Hugging Face Space is a fast and practical solution.

For production, replace the Hugging Face Space with:

- Self-hosted CatVTON
- Modal
- RunPod
- Hugging Face Inference Endpoint
- AWS GPU instance

By encapsulating CatVTON behind a service class or API layer, you can swap the inference backend later without changing your frontend or business logic.