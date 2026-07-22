# CatVTON Hugging Face API Integration Guide

This guide explains how to integrate the **CatVTON Hugging Face Space** into your application using the official **Gradio API**.

The API consists of **two sequential calls**:

1. Convert the uploaded model image into CatVTON's internal `ImageEditor` format.
2. Generate the try-on image using the garment image.

---

# Architecture

```text
React Frontend
        │
        ▼
FastAPI Backend
        │
        ▼
CatVTON Hugging Face API
        │
        ├── /person_example_fn
        └── /submit_function
        │
        ▼
Generated Product Image
        │
        ▼
Backend
        │
        ▼
Frontend
```

---

# Step 1: Install the Gradio Client

```bash
pip install gradio_client
```

---

# Step 2: Connect to the CatVTON Space

```python
from gradio_client import Client, handle_file

client = Client("zhengchong/CatVTON")
```

---

# Step 3: Convert the Model Image

CatVTON first converts the uploaded model image into an internal `ImageEditor` object.

```python
person = client.predict(
    image_path=handle_file("female_front.png"),
    api_name="/person_example_fn"
)
```

### Input

| Parameter | Type | Required |
|----------|------|----------|
| image_path | Image | Yes |

The image can be:

- Local file
- Public URL
- Base64 encoded image

---

### Output

```python
{
    "background": "...",
    "layers": [],
    "composite": "...",
    "id": "..."
}
```

This object should **not** be modified.

Pass it directly into the next API.

---

# Step 4: Generate the Try-On Image

```python
result = client.predict(
    person_image=person,
    cloth_image=handle_file("shirt.png"),
    cloth_type="upper",
    num_inference_steps=20,
    guidance_scale=2.5,
    seed=42,
    show_type="result only",
    api_name="/submit_function"
)
```

---

## Parameters

### person_image

Returned from `/person_example_fn`.

Type:

```
ImageEditor
```

Required:

```
Yes
```

---

### cloth_image

The garment image.

Type:

```
Image
```

Required:

```
Yes
```

---

### cloth_type

Possible values:

```python
"upper"
```

```python
"lower"
```

```python
"overall"
```

Recommended usage:

| Clothing | Value |
|----------|-------|
| Shirt | upper |
| T-shirt | upper |
| Jacket | upper |
| Hoodie | upper |
| Jeans | lower |
| Pants | lower |
| Shorts | lower |
| Skirt | lower |
| Dress | overall |
| Jumpsuit | overall |

---

### num_inference_steps

Default:

```python
50
```

Recommended:

```python
20
```

Lower values reduce latency while maintaining good quality.

---

### guidance_scale

Default:

```python
2.5
```

Recommended:

```python
2.5
```

---

### seed

Default:

```python
42
```

Use the same seed for deterministic outputs.

---

### show_type

Options:

```python
"result only"
```

```python
"input & result"
```

```python
"input & mask & result"
```

For product listing generation:

```python
show_type="result only"
```

---

# Step 5: Save the Generated Image

The API returns

```python
{
    "path": "/tmp/gradio/output.png",
    "url": None,
    ...
}
```

Save it:

```python
import shutil

shutil.copy(
    result["path"],
    "output.png"
)
```

or

```python
from PIL import Image

img = Image.open(result["path"])
img.save("output.png")
```

---

# Complete Working Example

```python
from gradio_client import Client, handle_file
import shutil

client = Client("zhengchong/CatVTON")

# Step 1: Convert model image
person = client.predict(
    image_path=handle_file("female_front.png"),
    api_name="/person_example_fn"
)

# Step 2: Generate try-on image
result = client.predict(
    person_image=person,
    cloth_image=handle_file("shirt.png"),
    cloth_type="upper",
    num_inference_steps=20,
    guidance_scale=2.5,
    seed=42,
    show_type="result only",
    api_name="/submit_function"
)

# Step 3: Save image
shutil.copy(result["path"], "output.png")

print("Image saved successfully.")
```

---

# Backend Workflow

```text
User uploads:

    Model Image
    Garment Image

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

Generated Product Image

            │
            ▼

Save to Storage

            │
            ▼

Return Image URL
```

---

# Generating Multiple Product Views

Assume you have:

```
female_front.png

female_side.png

female_back.png
```

Generate each catalog image independently.

```python
front = generate(front_model, shirt)

side = generate(side_model, shirt)

back = generate(back_model, shirt)
```

Each generation performs:

```text
/person_example_fn
        │
        ▼
/submit_function
```

---

# Recommended Backend Architecture

```text
React Frontend
        │
        ▼
FastAPI Backend
        │
        ├── Image Validation
        ├── Background Removal (Optional)
        ├── Garment Detection (Optional)
        │
        ▼
CatVTON Hugging Face API
        │
        ▼
Generated Product Image
        │
        ▼
Store Image
(Local / S3 / Cloudinary)
        │
        ▼
Return URL
```

---

# Error Handling

Since the CatVTON API is hosted as a public Hugging Face Space:

- Requests may queue during high traffic.
- The Space may restart.
- Temporary failures are possible.
- Response times may vary depending on GPU availability.

Recommended practices:

- Set request timeouts.
- Retry failed requests with exponential backoff.
- Cache generated images.
- Keep CatVTON integration isolated behind a service layer so the inference backend can be replaced later without changing the frontend.

---

# Advantages

- No GPU required.
- No deployment required.
- Free for development and hackathons.
- Official Gradio API.
- Simple Python integration.
- Easy migration to self-hosted CatVTON later.

---

# Limitations

- Public community-hosted Space.
- Rate limits may apply.
- Queue delays are possible.
- Not recommended for production-scale workloads.
- Availability depends on the Hugging Face Space remaining online.

---

# Complete System Flow

```text
React Frontend
        │
        ▼
FastAPI Backend
        │
        ├── Receive uploads
        ├── Validate images
        ├── Optional preprocessing
        │
        ▼
CatVTON API

    Step 1:
    /person_example_fn

        │

    Step 2:
    /submit_function

        │
        ▼
Generated Try-On Image
        │
        ▼
Save Image
        │
        ▼
Return Image URL
        │
        ▼
React Frontend
```

---

# API Endpoints Summary

| Endpoint | Purpose |
|----------|---------|
| `/person_example_fn` | Converts the uploaded model image into CatVTON's internal `ImageEditor` format. |
| `/submit_function` | Generates the final virtual try-on image using the prepared model image and garment image. |
| `/submit_function_flux` | Alternative FLUX-based virtual try-on endpoint with different guidance defaults. |
| `/submit_function_p2p` | Person-to-person try-on variant that omits the `cloth_type` parameter. |